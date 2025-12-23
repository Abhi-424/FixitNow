import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="font-sans text-gray-800 bg-white pt-20">
      {/* Hero Section */}
      <section className="bg-blue-50 py-20 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">About Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            FixitNow is your trusted partner for all household services. We verify professionals to ensure you get the best quality work, every time.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Who We Are</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We are a dedicated team of problem solvers committed to making home maintenance effortless. Founded with the belief that finding a reliable plumber or electrician shouldn’t be a hassle, FixitNow connects you with skilled professionals in minutes.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our platform bridges the gap between homeowners and service providers, ensuring transparency, safety, and efficiency in every job.
            </p>
          </div>
          <div className="bg-orange-100 rounded-2xl h-64 md:h-80 flex items-center justify-center">
             {/* Placeholder for an image */}
             <svg className="w-24 h-24 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-blue-800 p-10 rounded-2xl border border-blue-700 shadow-xl">
               <h3 className="text-2xl font-bold text-orange-500 mb-4">Our Mission</h3>
               <p className="text-blue-100 leading-relaxed">
                 To empower homeowners with a reliable, safe, and convenient way to book household services, while providing skilled professionals with a steady stream of dignified work.
               </p>
            </div>
            <div className="bg-blue-800 p-10 rounded-2xl border border-blue-700 shadow-xl">
               <h3 className="text-2xl font-bold text-orange-500 mb-4">Our Vision</h3>
               <p className="text-blue-100 leading-relaxed">
                 To become the world's most trusted platform for on-demand home services, revolutionizing the industry through technology and trust.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 md:px-12 text-center">
           <h2 className="text-3xl font-bold text-blue-900 mb-12">What We Offer</h2>
           <div className="flex flex-wrap justify-center gap-8">
             {["Expert Plumbing", "Safe Electrical Work", "Home Repairs", "Cleaning Services"].map((item, idx) => (
                <div key={idx} className="bg-gray-50 px-8 py-4 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500 transition-all cursor-default">
                   <span className="font-semibold text-blue-800">{item}</span>
                </div>
             ))}
           </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-3xl font-bold text-blue-900 text-center mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Trust", desc: "We verify every professional on our platform." },
              { title: "Quality", desc: "We guarantee high standards for every job." },
              { title: "Transparency", desc: "Upfront pricing with no hidden costs." },
              { title: "Satisfaction", desc: "Your happiness is our top priority." }
            ].map((val, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-md border-t-4 border-orange-500 text-center hover:-translate-y-1 transition-transform duration-300">
                <h3 className="text-xl font-bold text-blue-900 mb-2">{val.title}</h3>
                <p className="text-gray-500">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-center">
         <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Need Reliable Household Services?</h2>
            <Link to="/Register">
              <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition transform hover:scale-105">
                Book Now
              </button>
            </Link>
         </div>
      </section>
    </div>
  );
};

export default About;
