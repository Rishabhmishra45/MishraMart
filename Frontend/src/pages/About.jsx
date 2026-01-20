import React from "react";
import { useNavigate } from "react-router-dom";
import Rishabh from "../assets1/rishabh.webp";
import {
  FaTrophy,
  FaUsers,
  FaShippingFast,
  FaShieldAlt,
  FaAward,
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: <FaUsers className="text-2xl sm:text-3xl" />, number: "50K+", label: "Happy Customers" },
    { icon: <FaShippingFast className="text-2xl sm:text-3xl" />, number: "10K+", label: "Orders Delivered" },
    { icon: <FaTrophy className="text-2xl sm:text-3xl" />, number: "5★", label: "Customer Rating" },
    { icon: <FaAward className="text-2xl sm:text-3xl" />, number: "2K+", label: "Products" },
  ];

  const values = [
    {
      icon: <FaHeart className="text-xl sm:text-2xl" />,
      title: "Customer First",
      description:
        "Our customers are at the heart of everything we do. We strive to exceed expectations with every interaction.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: <FaTrophy className="text-xl sm:text-2xl" />,
      title: "Quality Excellence",
      description:
        "We are committed to providing premium quality products that stand the test of time and trends.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <FaShieldAlt className="text-xl sm:text-2xl" />,
      title: "Trust & Transparency",
      description:
        "We believe in building lasting relationships through honest and transparent business practices.",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  const team = [
    {
      name: "Rishabh Mishra",
      role: "Founder & CEO",
      image: Rishabh,
      description: "Visionary entrepreneur with 10+ years in fashion retail",
    },
    {
      name: "Bill Gates",
      role: "Head of Fashion",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      description: "Fashion expert with keen eye for trends and quality",
    },
    {
      name: "Rahul Verma",
      role: "Operations Head",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      description: "Ensures seamless customer experience and delivery",
    },
  ];

  return (
    <div
      className="min-h-screen pt-[70px] overflow-x-hidden"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* Hero Section */}
      <section className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-56 sm:w-72 h-56 sm:h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-60 sm:w-80 h-60 sm:h-80 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight">
            About{" "}
            <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
              MishraMart
            </span>
          </h1>

          <p className="text-sm sm:text-xl text-[color:var(--muted)] max-w-3xl mx-auto leading-relaxed">
            Your trusted partner in fashion since 2018. We're passionate about bringing you
            the latest trends with uncompromising quality and exceptional service.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="rounded-2xl p-4 sm:p-6 shadow-2xl border"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="text-cyan-400 mb-3 sm:mb-4 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-xl sm:text-3xl font-bold mb-1">{stat.number}</div>
                  <div className="text-[11px] sm:text-sm" style={{ color: "var(--muted)" }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 sm:mb-6">
                Our <span className="text-cyan-400">Story</span>
              </h2>

              <div className="space-y-4" style={{ color: "var(--muted)" }}>
                <p className="text-sm sm:text-lg leading-relaxed">
                  Founded in 2018, MishraMart began as a small boutique in Jaipur with a simple vision:
                  to make premium fashion accessible to everyone without compromising on quality.
                </p>
                <p className="text-sm sm:text-lg leading-relaxed">
                  What started as a single store has now grown into one of India's most trusted
                  online fashion destinations, serving thousands of customers nationwide.
                </p>
                <p className="text-sm sm:text-lg leading-relaxed">
                  Today, we continue to innovate and expand our collections while staying true to
                  our core values of quality, affordability, and exceptional customer service.
                </p>
              </div>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate("/collections")}
                  className="px-6 sm:px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition duration-300 flex items-center justify-center gap-2"
                >
                  Our Collections
                  <FaArrowRight className="text-sm" />
                </button>

                <button
                  onClick={() => navigate("/contact")}
                  className="px-6 sm:px-8 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white font-semibold rounded-xl transition duration-300"
                >
                  Contact Us
                </button>
              </div>
            </div>

            <div
              className="rounded-2xl p-5 sm:p-8 shadow-2xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop"
                alt="MishraMart Store"
                className="w-full h-48 sm:h-64 object-cover rounded-xl mb-5 sm:mb-6"
              />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
                From Humble Beginnings
              </h3>
              <p className="text-sm sm:text-base" style={{ color: "var(--muted)" }}>
                Our first store in Jaipur laid the foundation for what MishraMart is today -
                a brand built on trust, quality, and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 sm:mb-4">
              Our <span className="text-cyan-400">Values</span>
            </h2>
            <p className="text-sm sm:text-xl max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
              The principles that guide everything we do at MishraMart
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 sm:p-8 shadow-2xl border text-center"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${value.color} rounded-2xl text-white mb-5 sm:mb-6`}
                >
                  {value.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--muted)" }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3 sm:mb-4">
              Meet Our <span className="text-cyan-400">Team</span>
            </h2>
            <p className="text-sm sm:text-xl max-w-2xl mx-auto" style={{ color: "var(--muted)" }}>
              The passionate individuals behind MishraMart's success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 shadow-2xl border text-center"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-5 object-cover border-4 border-cyan-500/20"
                />
                <h3 className="text-lg sm:text-xl font-semibold mb-1">{member.name}</h3>
                <div className="text-cyan-400 font-medium text-sm sm:text-base mb-2">
                  {member.role}
                </div>
                <p className="text-xs sm:text-sm" style={{ color: "var(--muted)" }}>
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 sm:mb-6">
                Get In <span className="text-cyan-400">Touch</span>
              </h2>
              <p className="text-sm sm:text-lg mb-6 sm:mb-8" style={{ color: "var(--muted)" }}>
                Have questions or need assistance? We're here to help you with anything you need.
              </p>

              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-cyan-500 rounded-xl flex items-center justify-center">
                    <FaMapMarkerAlt className="text-white text-base sm:text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Our Address</h4>
                    <p className="text-xs sm:text-sm" style={{ color: "var(--muted)" }}>
                      123 Fashion Street, Jaipur, India - 302031
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <FaPhone className="text-white text-base sm:text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Phone Number</h4>
                    <p className="text-xs sm:text-sm" style={{ color: "var(--muted)" }}>
                      +91 98765 43210
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <FaEnvelope className="text-white text-base sm:text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Email Address</h4>
                    <p className="text-xs sm:text-sm" style={{ color: "var(--muted)" }}>
                      support@mishramart.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <FaClock className="text-white text-base sm:text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Working Hours</h4>
                    <p className="text-xs sm:text-sm" style={{ color: "var(--muted)" }}>
                      24/7 Customer Support
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 sm:p-8 shadow-2xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <h3 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6">
                Send us a Message
              </h3>

              {/* Existing form structure kept */}
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-xl outline-none border bg-transparent text-sm"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 rounded-xl outline-none border bg-transparent text-sm"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full px-4 py-3 rounded-xl outline-none border bg-transparent text-sm"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                />

                <textarea
                  placeholder="Your Message"
                  rows="5"
                  className="w-full px-4 py-3 rounded-xl outline-none border bg-transparent text-sm resize-none"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                ></textarea>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
