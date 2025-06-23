import { useEffect, useRef } from "react";

interface Particle {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  lifeSpan: number;
  initialLifeSpan: number;
  baseDimension: number;
  update: (context: CanvasRenderingContext2D) => void;
}

interface BubbleCursorOptions {
  element?: HTMLElement;
}

export const BubbleCursor: React.FC<BubbleCursorOptions> = ({ element }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const cursorRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    if (prefersReducedMotion.matches) {
      console.log("This browser has prefers reduced motion turned on, so the cursor did not init");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const targetElement = element || document.body;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Setup canvas
    const setupCanvas = () => {
      if (element) {
        canvas.width = element.clientWidth;
        canvas.height = element.clientHeight;
      } else {
        canvas.width = width;
        canvas.height = height;
      }
    };

    setupCanvas();
    cursorRef.current = { x: width / 2, y: height / 2 };

    // Particle class
    class ParticleImpl implements Particle {
      position: { x: number; y: number };
      velocity: { x: number; y: number };
      lifeSpan: number;
      initialLifeSpan: number;
      baseDimension: number;

      constructor(x: number, y: number) {
        const lifeSpan = Math.floor(Math.random() * 60 + 60);
        this.initialLifeSpan = lifeSpan;
        this.lifeSpan = lifeSpan;
        this.velocity = {
          x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() / 10),
          y: -0.4 + Math.random() * -1,
        };
        this.position = { x, y };
        this.baseDimension = 6;
      }

      update(context: CanvasRenderingContext2D) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.x += ((Math.random() < 0.5 ? -1 : 1) * 2) / 75;
        this.velocity.y -= Math.random() / 600;
        this.lifeSpan--;

        const scale = 0.2 + (this.initialLifeSpan - this.lifeSpan) / this.initialLifeSpan;

        // Draw heart instead of circle
        const heartSize = this.baseDimension * scale;
        const x = this.position.x;
        const y = this.position.y;

        context.fillStyle = "#7C3AED"; // Red heart color
        context.strokeStyle = "#6B21A8"; // Darker red border
        context.lineWidth = 0.5;

        // Draw heart shape
        context.beginPath();
        const topCurveHeight = heartSize * 0.3;
        context.moveTo(x, y + topCurveHeight);
        // Left side of heart
        context.bezierCurveTo(x, y, x - heartSize / 2, y, x - heartSize / 2, y + topCurveHeight);
        context.bezierCurveTo(x - heartSize / 2, y + (heartSize + topCurveHeight) / 2, x, y + (heartSize + topCurveHeight) / 2, x, y + heartSize);
        // Right side of heart
        context.bezierCurveTo(x, y + (heartSize + topCurveHeight) / 2, x + heartSize / 2, y + (heartSize + topCurveHeight) / 2, x + heartSize / 2, y + topCurveHeight);
        context.bezierCurveTo(x + heartSize / 2, y, x, y, x, y + topCurveHeight);
        context.fill();
        context.stroke();
        context.closePath();
      }
    }

    const addParticle = (x: number, y: number) => {
      particlesRef.current.push(new ParticleImpl(x, y));
    };

    const updateParticles = () => {
      if (particlesRef.current.length === 0) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Update particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        particlesRef.current[i].update(context);
      }

      // Remove dead particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        if (particlesRef.current[i].lifeSpan < 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      if (particlesRef.current.length === 0) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const loop = () => {
      updateParticles();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (element) {
        const boundingRect = element.getBoundingClientRect();
        cursorRef.current.x = e.clientX - boundingRect.left;
        cursorRef.current.y = e.clientY - boundingRect.top;
      } else {
        cursorRef.current.x = e.clientX;
        cursorRef.current.y = e.clientY;
      }
      addParticle(cursorRef.current.x, cursorRef.current.y);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        for (let i = 0; i < e.touches.length; i++) {
          addParticle(e.touches[i].clientX, e.touches[i].clientY);
        }
      }
    };

    const onWindowResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      setupCanvas();
    };

    // Bind events
    targetElement.addEventListener("mousemove", onMouseMove);
    targetElement.addEventListener("touchmove", onTouchMove, { passive: true });
    targetElement.addEventListener("touchstart", onTouchMove, { passive: true });
    window.addEventListener("resize", onWindowResize);

    // Start animation loop
    loop();

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      targetElement.removeEventListener("mousemove", onMouseMove);
      targetElement.removeEventListener("touchmove", onTouchMove);
      targetElement.removeEventListener("touchstart", onTouchMove);
      window.removeEventListener("resize", onWindowResize);
    };
  }, [element]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: element ? 'absolute' : 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 50
      }}
    />
  );
};