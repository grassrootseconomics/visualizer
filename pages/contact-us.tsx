import React from "react";
function ContactUs() {
  return (
    <div className="container mx-auto sm:px-4 container-contact pb-5">
      <div className="flex flex-wrap  pt-5">
        <div className="lg:w-1/2 px-4 md:w-1/2 sm:w-full pt-5">
          <h1 className="contact-center">Get in touch</h1>
          <div className="contact-center contact-wrap pt-3">
            <p>
              We would love to hear your feedback about our work, queries and
              your story!
            </p>
            <p>WhatsApp / Phone number: +254-757-628-885</p>
            <p>
              <a
                className="contact-link"
                href="https://chat.grassrootseconomics.net/cic/channels/town-square"
              >
                Join our chat server!
              </a>
            </p>
            <p>
              <a className="contact-link" href="https://discord.gg/ud32KMgH76">
                Join us on discord!
              </a>
            </p>
          </div>
        </div>
        <div className="lg:w-1/2 px-4 md:w-1/2 sm:w-full">
          <form
            className="pt-5"
            action="https://getform.io/f/a6936429-16b0-403b-b368-f2303e4dfef3"
            method="post"
          >
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                type="email"
                className="block appearance-none w-full py-1 px-2 mb-1 text-base leading-normal bg-white text-gray-800 border border-gray-200 rounded"
                id="email"
                name="email"
                aria-describedby="emailHelp"
                required
              />
              <div id="emailHelp" className="block mt-1">
                We'll never share your email with anyone else.
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="name-contact" className="form-label">
                Name
              </label>
              <input
                type="text"
                className="block appearance-none w-full py-1 px-2 mb-1 text-base leading-normal bg-white text-gray-800 border border-gray-200 rounded"
                id="name-contact"
                name="name"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">
                Subject
              </label>
              <input
                type="text"
                className="block appearance-none w-full py-1 px-2 mb-1 text-base leading-normal bg-white text-gray-800 border border-gray-200 rounded"
                id="subject"
                name="subject"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">
                Message
              </label>
              <textarea
                className="block appearance-none w-full py-1 px-2 mb-1 text-base leading-normal bg-white text-gray-800 border border-gray-200 rounded"
                id="message"
                rows={5}
                name="message"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="inline-block align-middle text-center select-none border font-normal whitespace-no-wrap rounded py-1 px-3 leading-normal no-underline btn-custom block w-full"
            >
              Send us a message!
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default ContactUs;
