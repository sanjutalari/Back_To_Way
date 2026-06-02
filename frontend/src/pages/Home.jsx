import React, { useEffect, useRef } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CanvasSequence from "../components/CanvasSequence";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const sectionsRef = useRef([]);

  const scenes = [
    {
      title: "Your Digital Life",
      subtitle: "Every device holds your work, memories, and identity.",
      align: "center"
    },
    {
      title: "Our Purpose",
      subtitle: "Securing your digital ecosystem.",
      description: "Back To Way is a dedicated global registry designed to protect your most valuable digital assets. Our mission is to connect owners with finders and to provide buyers with a transparent history of the devices they purchase. Whether you've lost a phone or want to verify a laptop before buying, our community-driven platform ensures your digital life remains in safe hands.",
      align: "left"
    },
    {
      title: "One Small Mistake",
      subtitle: "A single forgotten moment can change everything.",
      align: "right"
    },
    {
      title: "It's Missing",
      subtitle: "The realization hits harder than expected.",
      align: "right"
    },
    {
      title: "Take Action",
      subtitle: "Report your lost device in seconds.",
      align: "center"
    },
    {
      title: "Powered by Community",
      subtitle: "People helping people find what matters.",
      align: "left"
    },
    {
      title: "Reunited",
      subtitle: "Lost devices deserve a way back home.",
      align: "right"
    },
    {
      title: "Before You Buy",
      subtitle: "Know the history behind every device.",
      align: "left"
    },
    {
      title: "Verify with Confidence",
      subtitle: "Avoid stolen devices and risky purchases.",
      align: "right"
    },
    {
      title: "Building a Safer Future",
      subtitle: "Connecting owners, finders, and buyers worldwide.",
      align: "center",
      isLast: true
    }
  ];

  useEffect(() => {
    const tweens = [];
    
    sectionsRef.current.forEach((section) => {
      if (section) {
        const tween = gsap.fromTo(section, 
          { opacity: 0, y: 80, scale: 0.95 },
          {
            opacity: 1, 
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              end: "bottom 25%",
              toggleActions: "play reverse play reverse"
            }
          }
        );
        tweens.push(tween);
      }
    });

    return () => {
      tweens.forEach(t => {
        if (t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      });
    };
  }, []);

  return (
    <div className="bg-black text-white selection:bg-blue-500 selection:text-white font-sans">
      
      <div className="relative">
        {/* Render Canvas background (1000vh tall container) */}
        <CanvasSequence />

        {/* Overlay Content over 1000vh */}
        <div className="absolute top-0 left-0 w-full pointer-events-none z-10">
          
          {scenes.map((scene, index) => {
            // Determine alignment classes
            let flexAlign = "justify-center";
            let textAlign = "text-center";
            let margins = "mx-auto";
            
            if (scene.align === "left") {
              flexAlign = "justify-start";
              textAlign = "text-left";
              margins = "ml-4 md:ml-24";
            } else if (scene.align === "right") {
              flexAlign = "justify-end";
              textAlign = "text-right";
              margins = "mr-4 md:mr-24";
            }

            return (
              <div 
                key={index} 
                className={`h-screen flex items-center px-4 ${flexAlign}`}
              >
                <div 
                  ref={el => sectionsRef.current[index] = el}
                  className={`pointer-events-auto max-w-2xl ${margins} p-8 md:p-12 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]`}
                >
                  <h2 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 ${textAlign}`}>
                    {scene.title}
                  </h2>
                  <p className={`text-xl md:text-2xl text-gray-200 font-medium leading-relaxed ${textAlign}`}>
                    {scene.subtitle}
                  </p>
                  
                  {scene.description && (
                    <p className={`mt-6 text-lg text-gray-400 font-light leading-relaxed ${textAlign}`}>
                      {scene.description}
                    </p>
                  )}

                  {scene.isLast && (
                    <div className="mt-10 flex flex-wrap gap-4 justify-center">
                      <Link to="/post" className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-colors inline-flex items-center gap-2 group">
                        Report Lost Device
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link to="/verify" className="bg-blue-600/20 border border-blue-500/50 text-blue-400 px-8 py-4 rounded-full font-semibold hover:bg-blue-600/30 transition-colors inline-flex items-center gap-2">
                        <ShieldCheck size={20} />
                        Verify a Device
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add exactly 100vh of empty space at the end to match the 1000vh canvas height 
              (since 9 scenes = 900vh, we need 100vh more to hit the bottom correctly) */}
          <div className="h-screen flex items-center justify-center">
            {/* End of scroll buffer where the globe loops continuously */}
          </div>

        </div>
      </div>
    </div>
  );
}
