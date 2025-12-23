import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Import hero slider images
import electricianImg from "../assets/hero-slider/electrician.png";
import plumberImg from "../assets/hero-slider/plumber.png";
import repairImg from "../assets/hero-slider/repair.png";
import supportImg from "../assets/hero-slider/support.png";

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroImages = [electricianImg, plumberImg, repairImg, supportImg];

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPaused, heroImages.length]);

  return (
    <div className="w-full">

      {/* 1. HERO SECTION */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-blue-900 leading-tight mb-6">
                Expert Home Services <br /> at Your Doorstep
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0">
                Connect with verified professionals for all your home service needs. Fast, reliable, and secure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="px-10 py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform text-center">
                  Get Started Free
                </Link>
                <Link to="/services" className="px-10 py-4 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 hover:scale-105 transition-transform text-center">
                  Explore Services
                </Link>
              </div>
            </div>

            {/* Image Slider with Re-added Indicators */}
            <div
              className="relative h-[350px] md:h-[500px] lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {heroImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === currentImageIndex ? "opacity-100" : "opacity-0"}`}
                  alt="service"
                />
              ))}

              {/* RE-ADDED: Dots Indicator */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-3 rounded-full transition-all ${index === currentImageIndex
                      ? "bg-orange-500 w-8"
                      : "bg-white/50 hover:bg-white/75 w-3"
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="min-h-screen w-full flex items-center justify-center bg-white py-20">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-blue-900 mb-4">Services We Cover</h2>
          <p className="text-gray-500 mb-16">High-quality solutions for every corner of your home</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {["Plumbing", "Electrical", "Home Repairs", "AC Repair"].map((service, i) => (
              <div key={i} className="bg-blue-50 p-10 rounded-3xl border border-transparent hover:border-orange-500 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl group">
                <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="text-xl font-bold text-blue-900">{service}</h3>
              </div>
            ))}
          </div>
          <Link to="/services" className="inline-block px-12 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
            View All Services
          </Link>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="min-h-screen w-full flex items-center justify-center bg-blue-50 py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-blue-900 mb-4">How It Works</h2>
            <div className="w-20 h-1.5 bg-orange-500 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Select Service", desc: "Pick what you need from our list." },
              { step: "2", title: "Book a Pro", desc: "Choose a time that fits your schedule." },
              { step: "3", title: "Job Done", desc: "Sit back while our experts handle it." }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-white text-blue-900 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 shadow-xl border-4 border-orange-500">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 px-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US */}
      <section className="min-h-screen w-full flex items-center justify-center bg-white py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold text-blue-900 mb-8">Why Trust FixitNow?</h2>
              <div className="space-y-6">
                {[
                  { t: "Verified Professionals", d: "Strict background checks for your peace of mind." },
                  { t: "Fast Service", d: "Emergency support available 24/7." },
                  { t: "Transparent Pricing", d: "Know the cost before the work begins." }
                ].map((point, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white mt-1">✓</div>
                    <div>
                      <h4 className="font-bold text-blue-900 text-lg">{point.t}</h4>
                      <p className="text-gray-500">{point.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="h-64 bg-blue-50 rounded-3xl overflow-hidden flex items-center justify-center">
                <img
                  src="https://images.pexels.com/photos/8866790/pexels-photo-8866790.jpeg"
                  alt=""
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>

              <div className="h-64 bg-orange-50 mt-8 rounded-3xl overflow-hidden flex items-center justify-center">
                <img
                  src="https://images.pexels.com/photos/313776/pexels-photo-313776.jpeg"
                  alt=""
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. LIGHT THEMED FULL-VIEWPORT CTA */}
      <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-orange-50 snap-start shrink-0 relative overflow-hidden">

        {/* Subtle Background Elements to match Hero Section */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-100/30 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-orange-100/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">

          {/* Minimalist Badge */}
          <div className="flex justify-center mb-8">
            <span className="px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 text-sm font-bold tracking-widest uppercase border border-blue-600/10">
              Ready to start?
            </span>
          </div>

          {/* Elegant Typography */}
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-blue-900 mb-8 tracking-tight leading-tight">
            Transform Your Home <br />
            <span className="text-orange-500">Into Paradise.</span>
          </h2>

          {/* Light Subtext */}
          <p className="text-gray-600 text-lg md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
            Join 10,000+ happy homeowners who trust FixitNow for seamless repairs,
            expert maintenance, and total peace of mind.
          </p>

          {/* Clean Button Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/register"
              className="w-full sm:w-auto px-12 py-5 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 hover:bg-orange-600 hover:scale-105 transition-all duration-300 text-xl"
            >
              Get Started Free
            </Link>

            <Link
              to="/services"
              className="w-full sm:w-auto px-12 py-5 bg-white text-blue-900 border-2 border-blue-100 font-bold rounded-2xl hover:bg-blue-50 transition-all duration-300 text-xl shadow-sm"
            >
              Explore Services
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;