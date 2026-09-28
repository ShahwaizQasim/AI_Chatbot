import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { ArrowUp, Mic, Paperclip, Plus } from 'lucide-react';

export interface ChatInputProps {
    /** Called with the trimmed message when the user presses Enter or the send button. */
    onSend: (message: string) => void;
    /** Called with the selected files after the user picks attachments. */
    onAttach?: (files: File[]) => void;
    /** Called when the microphone button is pressed. Hidden if omitted. */
    onVoice?: () => void;
    /** Called when the plus button is pressed. Hidden if omitted. */
    onPlus?: () => void;
    /** Disable typing and sending, e.g. while a response is loading. */
    disabled?: boolean;
    placeholder?: string;
    /** Max characters. Set to 0 to hide the counter and remove the limit. */
    maxLength?: number;
    /** Max textarea height in px before it scrolls. */
    maxHeight?: number;
    /** Accepted file types for the attachment picker, e.g. "image/*,.pdf". */
    accept?: string;
    disclaimer?: string;
    className?: string;
}

const iconBtn =
    'grid h-9 w-9 shrink-0 place-items-center rounded-full text-zinc-500 transition-colors duration-150 ' +
    'hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200 disabled:pointer-events-none disabled:opacity-40 ' +
    'dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:active:bg-zinc-700 ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-500';

export default function ChatInput({
    onSend,
    onAttach,
    onVoice,
    onPlus,
    disabled = false,
    placeholder = 'Message AI...',
    maxLength = 4000,
    accept,
    disclaimer = 'AI can make mistakes. Check important information.',
    className = '',
}: ChatInputProps) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const composing = useRef(false); // IME composition (e.g. Japanese, Chinese input)

    const canSend = value.trim().length > 0 && !disabled;

    // Auto-grow up to maxHeight
    // useEffect(() => {
    //     const el = textareaRef.current;
    //     if (!el) return;
    //     el.style.height = 'auto';
    //     el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    // }, [value, maxHeight]);

    const submit = () => {
        if (!canSend) return;
        onSend(value.trim());
        setValue('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !composing.current && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
        }
    };

    // const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    //     const files = Array.from(e.target.files ?? []);
    //     if (files.length) onAttach?.(files);
    //     e.target.value = ''; // allow re-selecting the same file
    // };

    const nearLimit = maxLength > 0 && value.length > maxLength * 0.9;

    return (
        <div
            className={`sticky bottom-0 w-full px-3 pt-4 dark:from-zinc-950 dark:via-zinc-950 sm:px-4 ${className}`}
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
            <div className="mx-auto w-full max-w-3xl">
                <div
                    className={`flex items-end gap-1 rounded-[1.75rem] border border-zinc-200 bg-white p-2 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition duration-200
            focus-within:border-teal-500/60 focus-within:shadow-[0_4px_20px_rgba(13,148,136,0.12)]
            dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-none dark:focus-within:border-teal-500/60 ${disabled ? 'opacity-70' : ''}`}
                >
                    {onPlus && (
                        <button type="button" aria-label="More actions" className={`${iconBtn} hidden sm:grid`} onClick={onPlus} disabled={disabled}>
                            <Plus size={20} />
                        </button>
                    )}

                    {onAttach && (
                        <>
                            <input ref={fileRef} type="file" multiple accept={accept} className="hidden" tabIndex={-1} aria-hidden />
                            <button type="button" aria-label="Attach files" className={iconBtn} onClick={() => fileRef.current?.click()} disabled={disabled}>
                                <Paperclip size={19} />
                            </button>
                        </>
                    )}

                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={value}
                        disabled={disabled}
                        maxLength={maxLength || undefined}
                        placeholder={placeholder}
                        aria-label="Message"
                        enterKeyHint="send"
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onCompositionStart={() => (composing.current = true)}
                        onCompositionEnd={() => (composing.current = false)}
                        className="min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-base leading-6 text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500 sm:text-[15px]"
                    />

                    {onVoice && (
                        <button type="button" aria-label="Voice input" className={iconBtn} onClick={onVoice} disabled={disabled}>
                            <Mic size={19} />
                        </button>
                    )}

                    <button
                        type="button"
                        aria-label="Send message"
                        onClick={submit}
                        disabled={!canSend}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-600 text-white transition duration-150
              hover:scale-105 hover:bg-teal-700 active:scale-95
              disabled:scale-100 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400
              dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
                    >
                        <ArrowUp size={19} strokeWidth={2.25} />
                    </button>
                </div>

                <div className="mt-2 flex items-center justify-center gap-3 px-2 text-xs text-zinc-400 dark:text-zinc-500">
                    <p className="text-center">{disclaimer}</p>
                    {nearLimit && (
                        <span className="tabular-nums text-amber-600 dark:text-amber-400" aria-live="polite">
                            {value.length}/{maxLength}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}