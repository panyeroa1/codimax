/**
 * Autonomous Loop Service
 * Manages the "Manus-like" autonomous agent loop:
 * Thought -> Plan -> Action (Browse) -> Observation -> Repeat
 */

import { agentSkillStream, AgentMessage } from './agent';
import { parseNewCommands, executeBrowseCommand, BrowseCommand, BrowseResult } from './browseCommands';

export interface AgentPhase {
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface AgentState {
    status: 'idle' | 'thinking' | 'executing' | 'review' | 'done' | 'error';
    messages: AgentMessage[];
    currentTask: string;
    phases: AgentPhase[];
    browser: {
        url: string;
        title: string;
        screenshot: string | null;
        logs: string[];
    };
    narration: string;
}

export type StateListener = (state: AgentState) => void;

class AutonomousLoop {
    private state: AgentState;
    private listeners: Set<StateListener> = new Set();
    private abortController: AbortController | null = null;

    constructor() {
        this.state = {
            status: 'idle',
            messages: [],
            currentTask: '',
            phases: [],
            browser: { url: '', title: '', screenshot: null, logs: [] },
            narration: '',
        };
    }

    getState(): AgentState {
        return this.state;
    }

    subscribe(listener: StateListener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private update(partial: Partial<AgentState> | ((prev: AgentState) => Partial<AgentState>)) {
        if (typeof partial === 'function') {
            this.state = { ...this.state, ...partial(this.state) };
        } else {
            this.state = { ...this.state, ...partial };
        }
        this.listeners.forEach(l => l(this.state));
    }

    private updateBrowser(partial: Partial<AgentState['browser']>) {
        this.update(prev => ({ browser: { ...prev.browser, ...partial } }));
    }

    private log(message: string) {
        this.update(prev => ({ browser: { ...prev.browser, logs: [...prev.browser.logs, message] } }));
    }

    async start(goal: string) {
        if (this.state.status !== 'idle' && this.state.status !== 'done' && this.state.status !== 'error') {
            throw new Error('Agent is already running');
        }

        this.abortController = new AbortController();
        const signal = this.abortController.signal;

        this.update({
            status: 'thinking',
            currentTask: 'Initializing...',
            phases: [
                { title: 'Goal Analysis', status: 'in_progress' },
                { title: 'Search & Research', status: 'pending' },
                { title: 'Execution', status: 'pending' },
                { title: 'Final Review', status: 'pending' }
            ],
            messages: [{ role: 'user', content: goal }],
            narration: 'Starting task...',
            browser: { url: '', title: '', screenshot: null, logs: [`Received goal: ${goal}`] }
        });

        try {
            const MAX_STEPS = 20;
            let executedCommandsCount = 0;

            for (let step = 0; step < MAX_STEPS; step++) {
                if (signal.aborted) break;

                this.update({ status: 'thinking', currentTask: `Planning step ${step + 1}...` });
                this.log(`Step ${step + 1}: Analyzing...`);

                // 1. Get Agent Thought/Plan
                let stepResponse = '';
                let stepCommands: BrowseCommand[] = [];

                // We stream the thought process
                await agentSkillStream(
                    this.state.messages,
                    'web_browse',
                    (chunk) => {
                        stepResponse = chunk;
                        this.update({ narration: chunk });

                        // Check for new commands in real-time
                        const cmds = parseNewCommands(chunk, 0); // Always parse full chunk for UI, but execute logic handles dedup
                        // Ideally we'd visualize pending commands here
                    },
                    signal
                );

                if (signal.aborted) break;

                // Add assistant response to history
                const newMessages = [...this.state.messages, { role: 'assistant', content: stepResponse } as AgentMessage];
                this.update({ messages: newMessages });

                // 2. Parse Commands
                const allCommands = parseNewCommands(stepResponse, 0);
                stepCommands = allCommands.slice(executedCommandsCount); // Only new ones? 
                // Actually agentSkillStream returns FULL text, so we assume stepResponse is the full response for *this* turn.
                // Wait, parseNewCommands takes 'fullText' and 'executedCount'.
                // In the loop, we are getting a FRESH response for this turn.
                // So executedCommandsCount should reset? No, `parseNewCommands` logic in App.tsx was tricky.
                // Let's rely on the fact that `agentSkillStream` returns the accumulator for the CURRENT turn.
                // So we just parse *all* commands in `stepResponse`.
                stepCommands = parseNewCommands(stepResponse, 0);

                if (stepCommands.length === 0) {
                    this.log('No commands generated. Task complete or paused.');
                    this.update({ status: 'done', currentTask: 'Task Finished' });
                    break;
                }

                this.update(prev => {
                    const newPhases = [...prev.phases];
                    if (step === 0) {
                        newPhases[0].status = 'completed';
                        newPhases[1].status = 'in_progress';
                    } else if (step > 1) {
                        newPhases[1].status = 'completed';
                        newPhases[2].status = 'in_progress';
                    }
                    return { status: 'executing', currentTask: `Executing ${stepCommands.length} actions...`, phases: newPhases };
                });

                // 3. Execute Commands
                let observation = '';
                for (const cmd of stepCommands) {
                    if (signal.aborted) break;

                    this.log(`Executing: ${cmd.action} ${cmd.selector || ''} ${cmd.url || ''}`);
                    const result: BrowseResult = await executeBrowseCommand(cmd, 'manus-session'); // Use a dedicated session ID

                    if (result.screenshot) {
                        this.updateBrowser({
                            screenshot: result.screenshot,
                            url: result.url || this.state.browser.url,
                            title: result.title || this.state.browser.title
                        });
                    }

                    if (result.error) {
                        observation += `[Action Failed] ${cmd.action}: ${result.error}\n`;
                        this.log(`Error: ${result.error}`);
                    } else {
                        observation += `[Action OK] ${cmd.action}\n`;
                    }
                }

                // 4. Feed Observation back
                const nextUserMsg: AgentMessage = {
                    role: 'user',
                    content: `[OBSERVATION]\n${observation}\n\nContinue?`
                };
                this.update({ messages: [...this.state.messages, nextUserMsg] });

                // Wait a bit
                await new Promise(r => setTimeout(r, 1000));
            }

            this.update(prev => ({
                status: 'done',
                phases: prev.phases.map(p => ({ ...p, status: 'completed' }))
            }));
        } catch (err: any) {
            if (signal.aborted) {
                this.log('Task aborted by user.');
                this.update({ status: 'idle' });
            } else {
                console.error('Autonomous Loop Error:', err);
                this.log(`Example Error: ${err.message}`);
                this.update({ status: 'error', narration: `Error: ${err.message}` });
            }
        } finally {
            this.abortController = null;
        }
    }

    stop() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
            this.update({ status: 'idle' });
        }
    }
}

export const autonomousLoop = new AutonomousLoop();
