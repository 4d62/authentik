import React, { ReactNode, useState } from "react";

const IntegrationsMultilineCodeblock = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const content = React.Children.toArray(children)
        .map((child) => (typeof child === "string" ? child : ""))
        .join("")
        .replace(/\n\s+/g, "\n")
        .trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <pre className="integration-codeblock">
            <code className="integration-codeblock__content">{children}</code>
            <button
                onClick={handleCopy}
                className={`integration-codeblock__copy-btn ${
                    isCopied ? "integration-codeblock__copy-btn--copied" : ""
                }`}
                aria-label="Copy code to clipboard"
                title="Copy"
            >
                <span
                    className="integration-codeblock__copy-icons"
                    aria-hidden="true"
                >
                    <svg
                        viewBox="0 0 24 24"
                        className="integration-codeblock__copy-icon"
                    >
                        <path
                            fill="currentColor"
                            d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
                        />
                    </svg>
                    <svg
                        viewBox="0 0 24 24"
                        className="integration-codeblock__copy-success-icon"
                    >
                        <path
                            fill="currentColor"
                            d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                        />
                    </svg>
                </span>
            </button>
        </pre>
    );
};

export default IntegrationsMultilineCodeblock;
