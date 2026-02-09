import React, { useEffect, useState, useRef } from 'react';
import { autonomousLoop, AgentState } from '../services/autonomous-loop';
import {
    GlobeAltIcon,
    PaperClipIcon,
    PhotoIcon,
    MicrophoneIcon,
    ArrowUpIcon,
    StopIcon,
    ComputerDesktopIcon,
    ChevronDownIcon,
    CheckCircleIcon,
    ClockIcon,
    SparklesIcon,
    CommandLineIcon,
    CodeBracketIcon,
    PlayIcon,
    ArrowPathIcon,
    AdjustmentsHorizontalIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    PlusIcon,
    ShareIcon,
    EllipsisHorizontalIcon,
    UserPlusIcon,
    LinkIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { StopIcon as StopIconSolid, ComputerDesktopIcon as ComputerDesktopIconSolid } from '@heroicons/react/24/solid';

declare const marked: any;

export const AgentDashboard: React.FC = () => {
    const [state, setState] = useState<AgentState>(autonomousLoop.getState());
    const [goal, setGoal] = useState('');
    const [isInputFocused, setIsInputFocused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [rightPanelMode, setRightPanelMode] = useState<'preview' | 'code' | 'browser'>('preview');
    const [showPlanner, setShowPlanner] = useState(true);
    const [mobileViewMode, setMobileViewMode] = useState<'chat' | 'computer'>('chat');

    useEffect(() => {
        return autonomousLoop.subscribe(setState);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [state.messages]);

    const handleStart = () => {
        if (!goal.trim()) return;
        autonomousLoop.start(goal).catch(console.error);
    };

    const handleStop = () => {
        autonomousLoop.stop();
    };

    const isIdle = state.status === 'idle' || state.status === 'done' || state.status === 'error';

    // ── NEW THEME: Deep Navy/Violet ────────────────────────────────────────────────────────────
    const theme = {
        bg: 'bg-[#0a0b14]',
        bgLighter: 'bg-[#141625]',
        bgFloating: 'bg-[#1c1f33]',
        border: 'border-[#232742]',
        text: 'text-slate-300',
        accent: 'violet',
        accentText: 'text-violet-400',
        bubbleUser: 'bg-[#232742]',
        bubbleAgent: 'bg-transparent'
    };

    // ── IDLE STATE (Landing Page) ─────────────────────────────────────────────────────────────
    if (isIdle && state.messages.length === 0) {
        return (
            <div className={`flex h-screen ${theme.bg} ${theme.text} font-sans selection:bg-violet-500/30`}>
                {/* Sidebar (Minimal) */}
                <div className={`w-64 border-r ${theme.border} p-4 flex-col space-y-6 hidden md:flex ${theme.bg}`}>
                    <div className="flex items-center space-x-2 text-zinc-100 mb-4 px-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-indigo-600 rounded flex items-center justify-center">
                            <span className="text-white font-bold text-xs">C</span>
                        </div>
                        <span className="font-semibold tracking-tight">CodeMax</span>
                        <ChevronDownIcon className="w-3 h-3 text-zinc-500" />
                    </div>

                    <button
                        title="Start a new task"
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-zinc-100 ${theme.bgLighter} rounded-lg border ${theme.border} hover:border-violet-500/50 transition-colors text-left shadow-sm`}
                    >
                        <SparklesIcon className="w-4 h-4 text-violet-400" />
                        <span>New task</span>
                    </button>

                    <div className="flex-1" />

                    <div className={`p-4 rounded-xl bg-gradient-to-br from-[#1c1f33] to-[#0a0b14] border ${theme.border} relative overflow-hidden group cursor-pointer shadow-lg`}>
                        <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-xs font-medium text-white mb-1 relative z-10">Create skills</p>
                        <p className="text-[10px] text-slate-500 relative z-10">Expand CodeMax's capabilities with custom tools.</p>
                    </div>
                </div>

                {/* Main Content (Centered) */}
                <div className={`flex-1 flex flex-col items-center justify-center relative p-4 ${theme.bg}`}>
                    <div className="max-w-2xl w-full flex flex-col items-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
                        <h1 className="text-4xl md:text-5xl font-medium text-center text-slate-100 tracking-tight">
                            How can I help you today?
                        </h1>

                        <div className={`w-full ${theme.bgLighter} border transition-all duration-300 rounded-[32px] p-2 relative shadow-2xl ${isInputFocused ? 'border-violet-500/50 ring-1 ring-violet-500/20' : theme.border}`}>
                            <textarea
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setIsInputFocused(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleStart();
                                    }
                                }}
                                placeholder="State your goal or task..."
                                className="w-full bg-transparent border-none focus:ring-0 text-lg p-5 min-h-[80px] resize-none placeholder-slate-600 text-slate-100"
                            />

                            <div className="flex items-center justify-between px-4 pb-3 pt-2">
                                <div className="flex space-x-1">
                                    <button title="Attach file" className={`p-2.5 text-slate-500 hover:text-violet-400 transition-colors rounded-full hover:${theme.bgFloating}`}>
                                        <PlusIcon className="w-5 h-5" />
                                    </button>
                                    <button title="Add link" className={`p-2.5 text-slate-500 hover:text-violet-400 transition-colors rounded-full hover:${theme.bgFloating}`}>
                                        <LinkIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button title="Voice input" className={`p-2.5 text-slate-500 hover:text-violet-400 transition-colors rounded-full hover:${theme.bgFloating}`}>
                                        <MicrophoneIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        title="Send message"
                                        onClick={handleStart}
                                        disabled={!goal.trim()}
                                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${goal.trim() ? 'bg-white text-black hover:scale-105 shadow-lg shadow-violet-500/10' : 'bg-[#1c1f33] text-slate-600 cursor-not-allowed'}`}
                                    >
                                        <ArrowUpIcon className="w-5 h-5 stroke-[2.5]" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {['Search Web', 'Analyze Data', 'Write Code', 'Design UI'].map((action) => (
                                <button key={action} title={`Quick action: ${action}`} className={`px-5 py-2.5 rounded-full border ${theme.border} ${theme.bgFloating} hover:border-violet-500/50 text-slate-400 hover:text-white text-xs font-semibold transition-all shadow-sm`} onClick={() => setGoal(action)}>
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── ACTIVE CHAT STATE ────────────────────────────────────────────────────────────────────
    return (
        <div className={`flex h-screen ${theme.bg} ${theme.text} font-sans overflow-hidden`}>

            {/* LEFT/MAIN CHAT PANEL & COMPUTER DASHBOARD */}
            <div className={`flex-1 flex flex-col border-r ${theme.border} ${theme.bg} relative`}>
                {/* Header (Refined for Mobile) */}
                <div className={`h-16 flex items-center px-4 justify-between border-b ${theme.border} bg-[#0a0b14]/80 backdrop-blur-md z-10`}>
                    <div className="flex items-center space-x-4">
                        <button title="Back" className={`p-2 hover:${theme.bgLighter} rounded-lg transition-colors`}>
                            <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
                        </button>
                        <div className="flex flex-col">
                            <button
                                onClick={() => setMobileViewMode('chat')}
                                className="flex items-center space-x-1.5 hover:text-white transition-colors"
                            >
                                <span className="text-[15px] font-bold text-slate-100">
                                    {mobileViewMode === 'chat' ? 'CodeMax 1.0 Lite' : "CodeMax's computer"}
                                </span>
                                <ChevronDownIcon className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Mobile View Toggle */}
                        <button
                            title={mobileViewMode === 'chat' ? "Switch to computer view" : "Switch to chat"}
                            onClick={() => setMobileViewMode(mobileViewMode === 'chat' ? 'computer' : 'chat')}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all shadow-sm ${mobileViewMode === 'computer' ? 'bg-violet-600/20 border-violet-500/50 text-violet-400' : `${theme.bgLighter} border-slate-800 text-slate-400`}`}
                        >
                            <ComputerDesktopIcon className="w-5 h-5" />
                            <ChevronDownIcon className="w-3 h-3 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Content Area (Chat or Computer) */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                    {/* CHAT VIEW */}
                    <div className={`flex-1 overflow-y-auto p-4 space-y-8 scrollbar-thin scrollbar-thumb-[#232742] transition-opacity duration-300 ${mobileViewMode === 'chat' ? 'opacity-100 block' : 'opacity-0 hidden lg:block'}`}>
                        <div className="max-w-3xl mx-auto w-full space-y-10">
                            {state.messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="space-y-1.5 max-w-[88%] animate-in slide-in-from-right-3 duration-300">
                                            <div className="flex items-center justify-end space-x-2 text-[10px] text-slate-500 mb-1 px-1">
                                                <div className={`flex items-center px-3 py-0.5 rounded-full bg-[#1c1f33] border ${theme.border} text-[9px] font-bold uppercase tracking-wider`}>
                                                    Developing apps
                                                </div>
                                            </div>
                                            <div className={`${theme.bgFloating} text-slate-100 p-4 rounded-[24px] rounded-tr-[4px] text-[15px] leading-relaxed shadow-lg border ${theme.border}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 w-full animate-in fade-in slide-in-from-left-3 duration-500">
                                            <div className="flex items-center space-x-2.5">
                                                <div className="w-7 h-7 bg-white rounded flex items-center justify-center text-[12px] font-black text-black shadow-lg">C</div>
                                                <span className="text-[13px] font-bold text-slate-100 tracking-tight lowercase">codemax</span>
                                                <span className="text-[10px] bg-[#1c1f33] text-slate-500 px-1.5 py-0.5 rounded border border-[#232742] font-semibold tracking-tighter">Lite</span>
                                            </div>
                                            <div className="text-[16px] text-slate-200 leading-relaxed font-sans pl-9 max-w-[95%]">
                                                {msg.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {state.status !== 'idle' && (
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center space-x-2.5">
                                        <div className="w-7 h-7 bg-white rounded flex items-center justify-center text-[12px] font-black text-black shadow-lg">C</div>
                                        <span className="text-[13px] font-bold text-slate-100 tracking-tight lowercase">codemax</span>
                                        <span className="text-[10px] bg-[#1c1f33] text-slate-500 px-1.5 py-0.5 rounded border border-[#232742] font-semibold tracking-tighter">Lite</span>
                                    </div>
                                    <div className="pl-9 text-[15px] font-medium text-slate-500 animate-pulse">
                                        CodeMax is {state.status === 'thinking' ? 'thinking' : 'working'}...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COMPUTER DASHBOARD VIEW (Mobile Specific) */}
                    <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${theme.bg} transition-opacity duration-300 ${mobileViewMode === 'computer' ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                        <div className="max-w-md mx-auto w-full space-y-6">
                            {/* Computer Preview Card */}
                            <div className={`${theme.bgLighter} border ${theme.border} rounded-[24px] overflow-hidden shadow-2xl relative aspect-[4/3] flex flex-col items-center justify-center`}>
                                {state.browser.screenshot ? (
                                    <div className="w-full h-full flex flex-col">
                                        <div className="bg-slate-100/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                                            <div className="flex space-x-1.5">
                                                <div className="w-2 h-2 rounded-full bg-slate-700" />
                                                <div className="w-2 h-2 rounded-full bg-slate-700" />
                                                <div className="w-2 h-2 rounded-full bg-slate-700" />
                                            </div>
                                            <span className="text-[10px] text-slate-500 truncate max-w-[150px] font-mono">{state.browser.url}</span>
                                            <AdjustmentsHorizontalIcon className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <img
                                                src={`data:image/jpeg;base64,${state.browser.screenshot}`}
                                                className="w-full h-full object-cover"
                                                alt="Compute View"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                                        <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center ring-1 ring-white/10">
                                            <ComputerDesktopIcon className="w-12 h-12 text-slate-200" />
                                        </div>
                                        <p className="text-sm font-medium tracking-wide">CodeMax's computer is inactive</p>
                                    </div>
                                )}
                            </div>

                            {/* Status Card */}
                            <div className={`${theme.bgLighter} border ${theme.border} rounded-[20px] p-4 flex items-center space-x-4 shadow-lg`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${theme.border} ${state.status !== 'idle' ? 'bg-violet-600/10' : 'bg-transparent'}`}>
                                    <ComputerDesktopIconSolid className={`w-6 h-6 ${state.status !== 'idle' ? 'text-violet-500' : 'text-slate-700'}`} />
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <span className="text-[15px] font-bold text-slate-100">
                                        {state.status === 'idle' ? 'CodeMax is inactive' : 'CodeMax is active'}
                                    </span>
                                    <span className="text-[12px] text-slate-500">
                                        {state.status === 'idle' ? 'Waiting for instructions' : (state.currentTask || 'Executing phase...')}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Slider (Visual Only) */}
                            <div className="px-2">
                                <div className={`h-1.5 w-full rounded-full ${theme.bgFloating} relative overflow-hidden ring-1 ring-white/5`}>
                                    <div className="absolute inset-y-0 left-0 bg-violet-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.6)]" style={{ width: '40%' }} />
                                </div>
                            </div>

                            {/* Planner Widget */}
                            <div className={`${theme.bgLighter} border ${theme.border} rounded-[24px] overflow-hidden shadow-2xl`}>
                                <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-[16px] font-bold text-slate-100">Planner</span>
                                        <span className="text-[11px] text-slate-600 font-mono">0 / 5</span>
                                    </div>
                                    <ChevronDownIcon className="w-4 h-4 text-slate-600" />
                                </div>
                                <div className="p-5 space-y-4">
                                    {state.phases.map((phase, pIdx) => (
                                        <div key={pIdx} className={`flex items-start space-x-4 ${phase.status === 'pending' ? 'opacity-30' : 'opacity-100'}`}>
                                            <div className="w-5 h-5 mt-0.5 flex items-center justify-center">
                                                {phase.status === 'in_progress' && (
                                                    <div className="w-5 h-5 rounded-full border-2 border-dashed border-violet-500/50 flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-violet-500 rounded-full shadow-[0_0_8px_rgba(139,92,246,0.4)] animate-pulse" />
                                                    </div>
                                                )}
                                                {phase.status === 'completed' && (
                                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                                                )}
                                                {phase.status === 'pending' && (
                                                    <ClockIcon className="w-5 h-5 text-slate-600" />
                                                )}
                                                {phase.status === 'failed' && (
                                                    <XMarkIcon className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[14px] font-semibold tracking-tight ${phase.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                                                    {phase.title}
                                                </span>
                                                {phase.status === 'in_progress' && (
                                                    <span className="text-[11px] text-violet-400 mt-1 uppercase tracking-widest font-black">In Progress</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {state.phases.length === 0 && (
                                        <div className="text-xs text-slate-600 italic">No plan items yet...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Input (Shared) */}
                    <div className={`px-4 pb-8 ${theme.bg} z-20`}>
                        <div className="max-w-3xl mx-auto">
                            <div className={`${theme.bgFloating} rounded-[28px] p-2 flex items-center shadow-2xl border ${theme.border}`}>
                                <button title="Plus" className={`p-2.5 text-slate-500 hover:text-violet-400 hover:${theme.bgLighter} rounded-full transition-all`}>
                                    <PlusIcon className="w-6 h-6" />
                                </button>
                                <button title="Refresh" className={`p-2.5 text-slate-500 hover:text-violet-400 hover:${theme.bgLighter} rounded-full transition-all`}>
                                    <ArrowPathIcon className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={goal}
                                    onChange={e => setGoal(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                                    placeholder="Message CodeMax..."
                                    className="flex-1 bg-transparent border-none text-[15px] text-slate-100 placeholder-slate-600 focus:ring-0 px-2"
                                />
                                <div className="flex items-center space-x-1.5 pr-1">
                                    <button title="Voice" className={`p-2.5 text-slate-500 hover:text-violet-400 hover:${theme.bgLighter} rounded-full transition-all`}>
                                        <MicrophoneIcon className="w-6 h-6" />
                                    </button>
                                    {isIdle ? (
                                        <button
                                            title="Send"
                                            onClick={handleStart}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 shadow-lg ${goal.trim() ? 'bg-white text-black hover:scale-105' : 'bg-[#232742] text-slate-600'}`}
                                        >
                                            <ArrowUpIcon className="w-6 h-6 stroke-[2.5]" />
                                        </button>
                                    ) : (
                                        <button
                                            title="Stop"
                                            onClick={handleStop}
                                            className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg"
                                        >
                                            <StopIconSolid className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Desktop View only (Browser Preview) */}
            <div className="hidden lg:flex w-[550px] flex-col bg-[#050510]">
                <div className={`h-16 border-b ${theme.border} flex items-center justify-between px-6 ${theme.bg}`}>
                    <div className="flex items-center space-x-6">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Workspace</span>
                        <div className={`flex items-center ${theme.bgLighter} border ${theme.border} p-1 rounded-xl shadow-inner`}>
                            <button
                                title="Show preview"
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${rightPanelMode === 'preview' ? 'bg-[#1c1f33] text-white shadow-sm ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                                onClick={() => setRightPanelMode('preview')}
                            >
                                <GlobeAltIcon className="w-3.5 h-3.5 inline mr-2" />Preview
                            </button>
                            <button
                                title="Show code"
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${rightPanelMode === 'code' ? 'bg-[#1c1f33] text-white shadow-sm ring-1 ring-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                                onClick={() => setRightPanelMode('code')}
                            >
                                <CodeBracketIcon className="w-3.5 h-3.5 inline mr-2" />Code
                            </button>
                        </div>
                    </div>
                    <button title="Publish result" className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-violet-500/20 active:scale-95">
                        Publish
                    </button>
                </div>

                <div className="flex-1 overflow-auto relative bg-[#050510] p-6 flex flex-col items-center">
                    {state.browser.screenshot ? (
                        <div className={`w-full bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] overflow-hidden mb-6 border ${theme.border}`}>
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center space-x-3">
                                <div className="flex space-x-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="bg-white border border-slate-200 rounded-md px-3 py-0.5 text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                                        {state.browser.url}
                                    </div>
                                </div>
                            </div>
                            <img
                                src={`data:image/jpeg;base64,${state.browser.screenshot}`}
                                className="w-full h-auto"
                                alt="Live Result"
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center opacity-10 space-y-6">
                            <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center ring-8 ring-white/5">
                                <ComputerDesktopIcon className="w-16 h-16 text-black" />
                            </div>
                            <p className="text-sm font-black uppercase tracking-[0.3em] text-white">Live Workspace</p>
                        </div>
                    )}

                    <div className="mt-auto py-8 flex flex-col items-center text-slate-800 pointer-events-none">
                        <span className="text-[9px] uppercase tracking-[0.4em] font-black mb-1 opacity-50">engineered by</span>
                        <span className="text-base font-black tracking-tighter text-slate-700">CODEMAX</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
