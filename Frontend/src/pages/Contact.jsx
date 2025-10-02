import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
  FaWhatsapp,
  FaFacebookF,
  FaTwitter,
  FaInstagram
} from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt className="text-2xl" />,
      title: "Our Address",
      details: "123 Fashion Street, Jaipur, India - 302031",
      description: "Visit our flagship store in the heart of Jaipur",
      color: "bg-blue-500"
    },
    {
      icon: <FaPhone className="text-2xl" />,
      title: "Phone Number",
      details: "+91 98765 43210",
      description: "Mon to Sun 9:00 AM to 8:00 PM",
      color: "bg-green-500"
    },
    {
      icon: <FaEnvelope className="text-2xl" />,
      title: "Email Address",
      details: "support@mishramart.com",
      description: "Send us your query anytime!",
      color: "bg-purple-500"
    },
    {
      icon: <FaClock className="text-2xl" />,
      title: "Customer Support",
      details: "24/7 Available",
      description: "We're always here to help you",
      color: "bg-orange-500"
    }
  ];

  const socialLinks = [
    { icon: <FaWhatsapp />, name: "WhatsApp", url: "#", color: "hover:bg-green-500" },
    { icon: <FaFacebookF />, name: "Facebook", url: "#", color: "hover:bg-blue-600" },
    { icon: <FaTwitter />, name: "Twitter", url: "#", color: "hover:bg-blue-400" },
    { icon: <FaInstagram />, name: "Instagram", url: "#", color: "hover:bg-pink-500" }
  ];

  const faqs = [
    {
      question: "What are your shipping charges?",
      answer: "Free shipping on orders above ₹999. Below that, a flat ₹50 shipping charge applies."
    },
    {
      question: "How can I track my order?",
      answer: "You'll receive a tracking link via SMS and email once your order is shipped."
    },
    {
      question: "What is your return policy?",
      answer: "We offer 30-day returns for all products in original condition with tags attached."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we only ship within India. We're working on expanding internationally soon."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#141414] via-[#0c2025] to-[#141414] text-white pt-[70px]">

      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Get In <span className="text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">Touch</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're here to help you with any questions about our products, orders, or services.
            Reach out to us and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                  <div className="flex items-start gap-4">
                    <div className={`${info.color} w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                      <p className="text-cyan-400 font-medium mb-1">{info.details}</p>
                      <p className="text-gray-400 text-sm">{info.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Social Links */}
              <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className={`w-12 h-12 bg-gray-700 ${social.color} rounded-lg flex items-center justify-center text-white transition-all duration-300 transform hover:-translate-y-1`}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-8 shadow-2xl shadow-blue-900/20">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Send us a Message</h2>
                <p className="text-gray-400 mb-8">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this regarding?"
                      className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows="6"
                      className="w-full px-4 py-3 bg-[#141414] border border-gray-600 rounded-lg text-white placeholder-gray-400 outline-none focus:border-cyan-400 transition duration-300 resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-3"
                  >
                    <FaPaperPlane className="text-lg" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0f1b1d] to-[#0a1619]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked <span className="text-cyan-400">Questions</span>
            </h2>
            <p className="text-xl text-gray-300">
              Quick answers to common questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-6 shadow-2xl shadow-blue-900/20">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  {faq.question}
                </h3>
                <p className="text-gray-400 pl-5">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Store Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Visit Our <span className="text-cyan-400">Store</span>
              </h2>
              <div className="space-y-4 text-gray-300 mb-8">
                <p className="text-lg">
                  Experience the MishraMart difference in person at our flagship store in Jaipur.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-cyan-400" />
                    <span><strong>Store Hours:</strong> Mon-Sun 10:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-cyan-400" />
                    <span><strong>Store Phone:</strong> +91 98765 43211</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-cyan-400" />
                    <span><strong>Parking:</strong> Available in basement</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition duration-300">
                  Get Directions
                </button>
                <button className="px-6 py-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white font-semibold rounded-lg transition duration-300">
                  Call Store
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#0f1b1d] to-[#1a2a2f] border border-gray-700 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-blue-900/20">
              {/* Responsive Map Embed */}
              <div className="w-full aspect-[16/9] bg-gray-800 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1578.8686839596908!2d75.8906791283195!3d27.030161559822965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1759379072422!5m2!1sen!2sin"
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">
                  🎉 <strong>Special Offer:</strong> Mention this page and get 10% off on your first in-store purchase!
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;