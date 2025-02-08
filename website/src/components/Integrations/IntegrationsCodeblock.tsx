import React, { ReactNode, useState, isValidElement, useCallback } from "react";

type IntegrationsMultilineCodeblockProps = {
    children: ReactNode;
    className?: string;
};

type CopyButtonState = {
    isCopied: boolean;
    className: string;
};

type ContentProcessor = (children: ReactNode) => string;

const allowedTags = ["em", "code", "pre"];

const IntegrationsMultilineCodeblock: React.FC<
    IntegrationsMultilineCodeblockProps
> = ({ children, className = "" }) => {
    const [copyState, setCopyState] = useState<CopyButtonState>({
        isCopied: false,
        className: "",
    });

    const getTextContent = useCallback((nodes: ReactNode): string => {
        return React.Children.toArray(nodes).reduce((acc: string, node) => {
            if (typeof node === "string") {
                return acc + node;
            } else if (isValidElement(node)) {
                return acc + getTextContent(node.props.children);
            } else if (typeof node === "number") {
                return acc + String(node);
            }
            return acc;
        }, "");
    }, []);

    const processContent: ContentProcessor = useCallback(
        (children) => {
            const text = getTextContent(children);

            const sanitizedText = text.replace(
                /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
                (match, tag) => {
                    if (allowedTags.includes(tag.toLowerCase())) {
                        return match;
                    }
                    return "";
                },
            );

            return sanitizedText.trim();
        },
        [getTextContent],
    );

    const content: string = processContent(children);

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(content);
            setCopyState({
                isCopied: true,
                className: "integration-codeblock__copy-btn--copied",
            });

            setTimeout(() => {
                setCopyState((prev) =>
                    prev.isCopied ? { isCopied: false, className: "" } : prev,
                );
            }, 2000);
        } catch (error) {
            console.error("Failed to copy content:", error);
        }
    };

    type IconProps = {
        className: string;
        path: string;
    };

    const Icon: React.FC<IconProps> = React.memo(({ className, path }) => (
        <svg viewBox="0 0 24 24" className={className}>
            <path fill="currentColor" d={path} />
        </svg>
    ));

    return (
        <pre className={`integration-codeblock ${className}`.trim()}>
            <code className="integration-codeblock__content">
                {typeof children === "string" ? (
                    <span dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                    children
                )}
            </code>
            <button
                onClick={handleCopy}
                className={`integration-codeblock__copy-btn ${copyState.className}`.trim()}
                aria-label="Copy code to clipboard"
                title="Copy"
                type="button"
                disabled={copyState.isCopied}
            >
                <span
                    className="integration-codeblock__copy-icons"
                    aria-hidden="true"
                >
                    <Icon
                        className="integration-codeblock__copy-icon"
                        path="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
                    />
                    <Icon
                        className="integration-codeblock__copy-success-icon"
                        path="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                    />
                </span>
            </button>
        </pre>
    );
};

export default IntegrationsMultilineCodeblock;
