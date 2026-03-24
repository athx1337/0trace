import { useState, useEffect, useRef } from "react";
import './index.css';

const TOOLS = [
  {
    id: "03",
    name: "voidtrace",
    label: "VOIDTRACE",
    desc: "ip_intelligence // reputation & geolocation",
    category: "RECON",
    size: "4096",
    url: "https://voidtrace.vercel.app/",
    online: true,
  },
  {
    name: "webtrace",
    label: "WEBTRACE",
    desc: "domain_analysis // osint intelligence suite",
    size: "8192",
    url: "https://webtrace-lyart.vercel.app/",
    online: true,
  },
  {
    name: "phishx",
    label: "PHISHX",
    desc: "url_scanner // phishing detection engine",
    size: "4096",
    url: "https://phish-x.vercel.app/",
    online: true,
  },
  {
    name: "dnsmap",
    label: "DNSMAP",
    desc: "dns_recon // zone enumeration tool",
    size: "3120",
    url: "#",
    online: false,
  },
  {
    name: "portwatch",
    label: "PORTWATCH",
    desc: "port_scanner // service fingerprinting",
    size: "5640",
    url: "#",
    online: false,
  },
  {
    name: "certspy",
    label: "CERTSPY",
    desc: "cert_intel // tls certificate analyzer",
    size: "2880",
    url: "#",
    online: false,
  },
  {
    name: "darkping",
    label: "DARKPING",
    desc: "threat_feed // ioc correlation engine",
    size: "6144",
    url: "#",
    online: false,
  },
];

const DATE = "Mar 22 2026";
const PROMPT = "root@0trace:~$";

function useTypewriter(text: string, speed = 28, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

export default function App() {
  const [phase, setPhase] = useState<"typing-cmd" | "listing" | "idle" | "launching">("typing-cmd");
  const [visibleTools, setVisibleTools] = useState<number>(0);
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);
  const [launchingTool, setLaunchingTool] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const cmd = "ls -l /tools";
  const { displayed: typedCmd, done: cmdDone } = useTypewriter(cmd, 60, 600);

  // Blink cursor
  useEffect(() => {
    const t = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  // After command typed, show tool list line by line
  useEffect(() => {
    if (!cmdDone) return;
    setPhase("listing");
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleTools(count);
      if (count >= TOOLS.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("idle"), 300);
      }
    }, 90);
    return () => clearInterval(interval);
  }, [cmdDone]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleTools, phase, inputHistory]);

  const handleLaunch = (tool: typeof TOOLS[0]) => {
    if (!tool.online) return;
    setLaunchingTool(tool.name);
    setPhase("launching");
    setTimeout(() => {
      window.open(tool.url, "_blank");
      setTimeout(() => {
        setLaunchingTool(null);
        setPhase("idle");
      }, 1200);
    }, 600);
  };

  const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const val = inputVal.trim();
    if (!val) return;

    if (val.toLowerCase() === "clear") {
      setInputHistory([]);
      setInputVal("");
      return;
    }

    const newHistory = [...inputHistory, val];
    const args = val.split(" ").filter(Boolean);
    const cmd = args[0].toLowerCase();

    if (cmd === "help") {
      newHistory.push("__help__");
    } else if (cmd === "ls" || cmd === "ll" || cmd === "dir") {
      newHistory.push("__ls__");
    } else if (cmd === "whoami") {
      newHistory.push("__output__:root");
    } else if (cmd === "pwd") {
      newHistory.push("__output__:/home/root/tools");
    } else if (cmd === "date") {
      newHistory.push(`__output__:${new Date().toString()}`);
    } else if (cmd === "echo") {
      newHistory.push(`__output__:${args.slice(1).join(" ")}`);
    } else if (cmd === "sudo") {
      newHistory.push("__error__:user is not in the sudoers file. This incident will be reported.");
    } else {
      let matched = TOOLS.find(t => t.name === cmd || `./${t.name}` === cmd || t.label.toLowerCase() === cmd);
      if (cmd.startsWith("./")) {
        const withoutDotSlash = cmd.substring(2);
        matched = TOOLS.find(t => t.name === withoutDotSlash || t.label.toLowerCase() === withoutDotSlash);
      }

      if (matched) {
        handleLaunch(matched);
      } else {
        newHistory.push(`__error__:command not found: ${cmd}`);
      }
    }

    setInputHistory(newHistory);
    setInputVal("");
  };

  const onlineCount = TOOLS.filter(t => t.online).length;
  const totalCount = TOOLS.length;

  return (
    <>
      <div className="scanlines" />
      <div className="crt-flicker" />

      <div className="crt-container" onClick={() => phase === "idle" && inputRef.current?.focus()}>
        
        <div className="header-line">
          <span>0TRACE TERMINAL v1.0 // MULTI-TOOL SUITE</span>
          <span>{DATE}</span>
        </div>

        <img src="/0trace-ascii-removebg-preview.png" alt="0trace banner" className="ascii-banner" />

        <div className="divider">
          {"─".repeat(72)}
        </div>

        <div className="cmd-line">
          <span className="cmd-prompt">{PROMPT} </span>
          <span>{typedCmd}</span>
          {!cmdDone && (
            <span className={`cursor ${showCursor ? "" : "hidden"}`} />
          )}
        </div>

        {cmdDone && (
          <div className="tool-list-container">
            <div className="tool-list-header">
              total {totalCount} &nbsp;&nbsp; [{onlineCount} online // {totalCount - onlineCount} offline]
            </div>

            {TOOLS.slice(0, visibleTools).map((tool, i) => {
              const hoverClass = hoveredTool === i && tool.online ? "hovered" : "";
              const stateClass = tool.online ? "online" : "offline";
              
              return (
                <div
                  key={tool.name}
                  onClick={() => handleLaunch(tool)}
                  onMouseEnter={() => setHoveredTool(i)}
                  onMouseLeave={() => setHoveredTool(null)}
                  className={`tool-item ${stateClass} ${hoverClass}`}
                >
                  <span className="tool-perms">{tool.online ? "-rwxr-xr-x" : "-rw-r--r--"}</span>
                  <span className="tool-links">1</span>
                  <span className="tool-owner">root</span>
                  <span className="tool-owner">athx</span>
                  <span className="tool-size">{tool.size}</span>
                  <span className="tool-date">{DATE}</span>
                  <span className="tool-name">{tool.name}</span>
                  <span className="tool-desc"># {tool.desc}</span>
                  
                  {!tool.online && (
                    <span className="tool-offline-tag">[OFFLINE]</span>
                  )}
                  {hoveredTool === i && tool.online && (
                    <span className="tool-launch-hint">→ ENTER TO LAUNCH</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {launchingTool && (
          <div className="launch-seq">
            <div style={{ opacity: 0.5, marginBottom: "0.25rem" }}>
              <span>{PROMPT}</span> ./{launchingTool}
            </div>
            <div className="launch-init">
              <span className="launch-init-text">initializing </span>
              <span className="launch-init-name">{launchingTool}</span>
              <span className="launch-init-text">...</span>
            </div>
            <div className="launch-redir">redirecting to secure endpoint</div>
          </div>
        )}

        {inputHistory.map((line, i) => {
          if (line.startsWith("__error__:")) {
            return (
              <div key={i} className="history-err">
                0trace: {line.replace("__error__:", "")}
              </div>
            );
          }
          if (line === "__help__") {
            return (
              <div key={i} className="history-help">
                <div>available commands:</div>
                <div className="history-help-indent">{"./[toolname]  — launch tool"}</div>
                <div className="history-help-indent">{"ls            — list tools"}</div>
                <div className="history-help-indent">{"whoami        — print active user"}</div>
                <div className="history-help-indent">{"pwd           — print working directory"}</div>
                <div className="history-help-indent">{"date          — print current date"}</div>
                <div className="history-help-indent">{"echo [text]   — print text"}</div>
                <div className="history-help-indent">{"clear         — clear history"}</div>
                <div className="history-help-indent">{"help          — show this message"}</div>
              </div>
            );
          }
          if (line === "__ls__") {
            return (
              <div key={i} className="tool-list-container" style={{ margin: "0.5rem 0" }}>
                <div className="tool-list-header">
                  total {totalCount} &nbsp;&nbsp; [{onlineCount} online // {totalCount - onlineCount} offline]
                </div>
                {TOOLS.map((tool) => (
                  <div key={tool.name} className={`tool-item ${tool.online ? "online" : "offline"}`} style={{ opacity: 0.8, cursor: "default" }}>
                    <span className="tool-perms">{tool.online ? "-rwxr-xr-x" : "-rw-r--r--"}</span>
                    <span className="tool-links">1</span>
                    <span className="tool-owner">root</span>
                    <span className="tool-owner">athx</span>
                    <span className="tool-size">{tool.size}</span>
                    <span className="tool-date">{DATE}</span>
                    <span className="tool-name">{tool.name}</span>
                    <span className="tool-desc"># {tool.desc}</span>
                    {!tool.online && <span className="tool-offline-tag">[OFFLINE]</span>}
                  </div>
                ))}
              </div>
            );
          }
          if (line.startsWith("__output__:")) {
            return (
              <div key={i} className="history-line" style={{ opacity: 0.8, marginTop: "-0.125rem", whiteSpace: "pre-wrap" }}>
                {line.replace("__output__:", "")}
              </div>
            );
          }
          return (
            <div key={i} className="history-line">
              <span className="cmd-prompt">{PROMPT} </span>{line}
            </div>
          );
        })}

        {phase === "idle" && (
          <div className="active-input-wrap">
            <span className="cmd-prompt" style={{ marginRight: '4px' }}>{PROMPT}</span>
            <div className="input-container">
              <input
                ref={inputRef}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleInput}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                className="terminal-input"
              />
              <span 
                className={`cursor ${showCursor ? "" : "hidden"}`} 
                style={{ 
                  position: 'absolute', 
                  left: `${inputVal.length}ch`,
                  marginLeft: '2px',
                  pointerEvents: 'none'
                }} 
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: "2rem" }} />
      </div>

      <div className="footer">
        <span>0TRACE // MULTI-TOOL SUITE // ATHX1337</span>
        <span>{onlineCount}/{totalCount} TOOLS ONLINE</span>
      </div>
    </>
  );
}
