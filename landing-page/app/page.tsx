"use client";

import { faDiscord, faNodeJs } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";
import { CopyCheckIcon, CopyIcon, GithubIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function Home() {
  const expressCode = `import { heimdall } from "@heimdall-sdk/express";
import express from "express";

const app = express();

app.use(express.json());
app.use(
  heimdall({
        baseUrl: "http://localhost:8080",
        serviceName: "my-company-api",
        apiKey: "heim_XXXX", // Replace with your actual API key generated from Sentinel
        flushIntervalMs: 10_000, // Optional: default is 10,000 ms
        flushSize: 50, // Optional: default is 50
  })
);

app.get("/", async (req, res) => {
  res.status(200).json({ message: "hello world" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:3001");
});`;
  const containerRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const currentElement = containerRef.current;
    if (!currentElement) return;

    const onScroll = () => {
      setScrolled(currentElement.scrollTop > 0);
    };

    currentElement.addEventListener("scroll", onScroll);

    return () => currentElement.removeEventListener("scroll", onScroll);
  }, []);

  const handleCopyDockerContainer = () => {
    navigator.clipboard.writeText(
      "docker run -d -e ROOT_USERNAME=admin -e ROOT_PASSWORD=admin -p 80:80 mateusgcoelho/sentinel:latest"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyExpressIntegration = () => {
    navigator.clipboard.writeText(expressCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main
      ref={containerRef}
      className="relative w-screen h-screen flex flex-col overflow-y-auto text-foreground/60"
    >
      <header
        className={clsx(
          "sticky w-full border-b border-b-background py-2 top-0 left-0 flex items-center z-10 transition-colors px-4",
          scrolled && "border-border! bg-background/60 backdrop-blur-sm!"
        )}
      >
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center h-full px-6 bg-linear-to-r from-foreground to-foreground/30 bg-clip-text text-transparent">
            heimdall
          </h1>

          <nav className="flex items-center gap-10">
            <a
              href="https://github.com/JMCDynamics/sentinel"
              target="_blank"
              className="text-sm flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              <span>GitHub Repository</span>
            </a>
          </nav>
        </div>
      </header>

      <div className="flex-1 min-h-full flex items-center justify-center px-6 py-20">
        <div
          className="
            h-full w-full
            absolute inset-0
            -z-10
            bg-[url('/background1.jpg')]
            bg-cover bg-center
            opacity-20
            pointer-events-none
          "
        />

        <section className="w-full flex flex-col items-center gap-10 m-auto">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-7xl max-w-4xl mx-auto font-serif text-foreground">
              Monitoring doesn{""}t need to be complicated
            </h1>

            <p className="text-sm text-foreground/40 max-w-lg mx-auto">
              Deploy in minutes, monitor with confidence, and receive real time
              alerts on Discord or Slack.
            </p>
          </div>

          <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-2">
            <a
              href="#get-started"
              className="text-foreground cursor-pointer bg-clip-padding bg-linear-to-r from-secondary to-background px-6 py-2 rounded-lg font-bold text-sm border-2 border-border hover:border-primary transition-all hover:to-secondary!"
            >
              <span>Get Started</span>
            </a>
            <a
              href="https://discord.gg/uYVmnZCsR8"
              target="_blank"
              className="cursor-pointer px-6 py-2 font-bold text-sm text-foreground/40 hover:text-foreground transition-colors"
            >
              <FontAwesomeIcon icon={faDiscord} className="w-4 h-4 mr-2" />
              <span>Discord Community</span>
            </a>
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-4 mt-20">
            <p className="text-sm text-foreground/40">Early Adopters</p>

            <FidexaLogo />
          </div>
        </section>
      </div>

      <div
        id="get-started"
        className="flex-1 min-h-full flex flex-col items-center justify-center pt-10"
      >
        <div className="w-full flex flex-col max-w-2xl mx-auto text-center text-foreground gap-8">
          <p className="text-6xl">
            It{"'"}s simple as running a single Docker command
          </p>

          <p className="text-sm text-foreground/40">
            Deploy Heimdall in minutes with our easy-to-use Docker image. Get
            started quickly and start monitoring your services right away.
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto px-6 mt-10">
          <div className="flex items-center gap-2 bg-background/50 border-2 border-border rounded-3xl shadow-lg p-4 px-6 mt-10 text-sm text-foreground font-mono overflow-x-auto">
            <div className="w-full flex-1">
              docker run -d -e ROOT_USERNAME=admin -e ROOT_PASSWORD=admin -p
              80:80 mateusgcoelho/sentinel:latest
            </div>

            <button
              onClick={handleCopyDockerContainer}
              disabled={copied}
              title="Copy to clipboard"
              className="cursor-pointer text-foreground/40 hover:text-foreground transition-colors"
            >
              {copied ? (
                <CopyCheckIcon className="w-4 h-4" />
              ) : (
                <CopyIcon className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="w-full h-100 my-10 relative rounded-xl overflow-hidden">
            <iframe
              src="https://app.supademo.com/embed/cmj5zojz10na8byg7r97f0mg4?embed_v=2&utm_source=embed"
              loading="lazy"
              title="Set Up Integrations, Monitors, and API Tokens in Heimdall"
              allow="clipboard-write"
              frameBorder="0"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            ></iframe>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-10 pb-10">
        <div className="w-full flex flex-col max-w-xl mx-auto text-center text-foreground gap-8">
          <p className="text-6xl">Integrate now</p>

          <p className="text-foreground/50">
            We also provide integration with popular tools like Express.js, to
            easyly add monitoring capabilities to your existing applications.
          </p>
        </div>

        <div className="flex items-center">
          <button className="text-foreground flex flex-col gap-2 items-center">
            <div className="p-3 border border-primary rounded-xl shadow-sm bg-linear-to-b from-secondary to-background/40 flex items-center justify-center">
              <FontAwesomeIcon icon={faNodeJs} size="2x" />
            </div>

            <span className="text-sm">Express.js</span>
          </button>
        </div>

        <div className="w-full flex flex-col max-w-4xl mx-auto border rounded-xl shadow-sm">
          <div className="w-full flex items-center justify-end border-b py-4 px-6">
            <button
              onClick={handleCopyExpressIntegration}
              disabled={copied}
              title="Copy to clipboard"
              className="cursor-pointer text-foreground/40 hover:text-foreground transition-colors"
            >
              {copied ? (
                <CopyCheckIcon className="w-4 h-4" />
              ) : (
                <CopyIcon className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex-1 h-full p-6 flex flex-col overflow-hidden">
            <SyntaxHighlighter
              language="typescript"
              style={dracula}
              customStyle={{
                background: "transparent",
              }}
            >
              {expressCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </main>
  );
}

const FidexaLogo = () => (
  <svg
    width={140}
    height={38.66543095458758}
    viewBox="0 0 1079 298"
    xmlns="http://www.w3.org/2000/svg"
    className="fill-foreground bg-clip-padding"
    fill="#161616"
  >
    <path d="M0.499992 121.755V83.0948H40C48.82 83.0948 59.75 84.7747 68.15 86.4547L68.57 85.6147C60.17 83.9347 47.98 82.2548 41.68 76.7948C34.96 71.3348 28.23 62.5147 28.23 51.5847C28.23 25.1147 50.08 0.744751 133.27 0.744751V36.0347C92.51 36.0347 68.57 44.4347 68.57 59.1447C68.57 73.8547 87.9 83.0948 103.44 83.0948H133.27V121.755H85.79V294.865H45.03V121.755H0.48999H0.499992Z" />
    <path d="M305.85 82.4051C333.58 81.9851 368.45 95.4251 387.78 115.595C394.5 122.315 399.12 134.505 402.07 143.325H402.91C399.97 134.085 397.45 121.895 397.45 112.235V0.895142H438.63V295.005H397.45V269.375C397.45 259.715 399.97 247.525 402.91 238.705L402.07 238.285C399.13 247.105 394.51 259.295 387.78 266.015C368.03 285.765 333.58 297.525 305.85 297.525C243.25 297.525 205.85 262.655 205.85 189.965C205.85 117.275 243.24 82.8251 305.85 82.4051ZM247.03 189.965C247.03 239.545 268.46 262.235 319.3 262.235C356.69 262.235 397.45 235.345 397.45 189.965C397.45 144.585 356.69 116.015 319.3 116.435C268.04 116.855 247.03 140.385 247.03 189.965Z" />
    <path d="M447.13 189.965C447.13 117.275 500.07 81.9847 562.25 82.4047C624.01 82.8247 674.01 117.275 674.01 189.965C674.01 195.845 674.01 196.265 673.17 201.725H489.98C496.28 243.315 524.43 264.325 563.09 263.905C595.44 263.485 621.07 253.405 632.84 222.305L670.65 227.345C654.68 278.185 611.83 297.095 562.25 297.515C500.07 297.935 447.13 262.645 447.13 189.955V189.965ZM489.98 201.725C496.28 179.035 506.37 176.515 526.53 176.515H634.93C629.05 133.655 601.32 115.175 563.08 114.755C525.69 114.335 485.77 142.905 489.97 201.725H489.98Z" />
    <path d="M650.9 84.9254H703.42L755.52 150.885C758.46 154.665 759.72 160.125 759.72 165.175H760.56C760.56 160.135 762.24 154.675 765.18 150.885L816.86 84.9254H868.96L787.45 189.125L868.96 295.005H817.28L764.76 227.355C761.82 223.575 760.56 217.695 760.56 213.075H759.72C759.72 217.695 758.04 223.575 755.1 227.355L703 295.005H650.9L732.83 189.125L650.9 84.9254Z" />
    <path d="M931.14 294.585C889.97 294.585 849.63 273.575 849.63 235.345C849.63 142.905 1017.69 196.265 1016.43 160.975C1015.17 129.045 994.58 116.855 954.67 116.855C922.32 116.855 896.69 124.835 892.07 158.025L855.94 152.985C861.4 102.145 909.72 83.2349 954.68 83.6549C1005.52 84.0749 1055.94 102.985 1055.94 166.005V242.475C1055.94 253.405 1059.72 255.925 1068.54 255.925H1078.2V295.005H1051.31C1030.3 295.005 1016.44 280.305 1016.44 261.815V243.325C1004.68 278.615 967.28 294.585 931.15 294.585H931.14ZM941.23 266.855C976.1 266.855 1016.44 250.045 1016.44 220.635V192.905C980.31 213.915 889.97 184.085 889.97 234.495C889.97 256.765 913.92 266.845 941.23 266.845V266.855Z" />
    <path d="M148.44 46.1549C148.44 62.8849 158.45 77.2349 172.72 83.3849C172.85 83.4449 172.99 83.4949 173.12 83.5549C173.43 83.6849 173.74 83.8049 174.06 83.9349C174.29 84.0249 174.51 84.1049 174.75 84.1949C174.84 84.2249 174.93 84.2549 175.03 84.2949C175.82 84.5749 176.66 84.8349 177.55 85.0749C180.69 85.9149 183.51 86.2049 185.77 86.2549L185.72 86.7749C183.36 86.6749 180.55 86.3549 177.45 85.5849C177.4 85.5749 177.36 85.5549 177.31 85.5449H148.44V295.745H195.07V86.5949V46.1549H148.43H148.44Z" />
  </svg>
);
