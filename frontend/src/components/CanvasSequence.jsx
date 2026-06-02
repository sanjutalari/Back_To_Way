import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function CanvasSequence() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const frameCount = 120;
    
    const currentFrame = (index) => 
      `/sequence/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.png`;

    const images = [];
    const airpods = { frame: 0 };
    
    const render = () => {
      const img = images[Math.floor(airpods.frame)];
      if (!img || !img.complete) return;
      
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      
      const centerShift_x = (canvas.width - img.width * ratio) / 2;
      const centerShift_y = (canvas.height - img.height * ratio) / 2;
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        img, 
        0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
      );
    };

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        render();
      }
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      img.onload = () => {
        if (i === Math.floor(airpods.frame)) {
          render();
        }
      };
      images.push(img);
    }

    images[0].onload = () => {
      resizeCanvas();
    };
    
    window.addEventListener('resize', resizeCanvas);

    const tween = gsap.to(airpods, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      },
      onUpdate: render // onUpdate is bound to the Tween, not ScrollTrigger
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (tween) {
        tween.kill();
      }
      // Only kill ScrollTriggers explicitly attached to this container
      ScrollTrigger.getAll().forEach(t => {
        if (t.trigger === containerRef.current) {
          t.kill();
        }
      });
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[1000vh] bg-black">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
        {/* Subtle radial gradient overlay to make text pop even more */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80"></div>
      </div>
    </div>
  );
}
