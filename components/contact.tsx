"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";
import { sendEmail } from "@/actions/sendEmail";
import SubmitBtn from "./submit-btn";
import toast from "react-hot-toast";
import { HiDownload, HiOutlineMail } from "react-icons/hi";
import { BsLinkedin } from "react-icons/bs";
import { FaGithubSquare } from "react-icons/fa";

export default function Contact() {
  const { ref } = useSectionInView("Contact");

  const copyEmail = () => {
    const email = "fwdkrishna@gmail.com";
    navigator.clipboard
      .writeText(email)
      .then(() => toast.success("Email copied to clipboard!"))
      .catch((err) => toast.error(err));
  };

  return (
    <motion.section
      id="contact"
      ref={ref}
      className="mb-20 w-[min(100%,38rem)] text-center sm:mb-28"
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      transition={{
        duration: 1,
      }}
      viewport={{
        once: true,
      }}
    >
      <SectionHeading>Contact me</SectionHeading>

      <p className="-mt-6 text-gray-700 dark:text-white/80">
        Feel free to connect with me on Linkedin / Email
      </p>

      {/* <form
        className="mt-10 flex flex-col dark:text-black"
        action={async (formData) => {
          const { data, error } = await sendEmail(formData);

          if (error) {
            toast.error(error);
            return;
          }

          toast.success("Email sent successfully!");
        }}
      >
        <input
          className="borderBlack h-14 rounded-lg px-4 transition-all dark:bg-white dark:bg-opacity-80 dark:outline-none dark:focus:bg-opacity-100"
          name="senderEmail"
          type="email"
          required
          maxLength={500}
          placeholder="Your email"
        />
        <textarea
          className="borderBlack my-3 h-52 rounded-lg p-4 transition-all dark:bg-white dark:bg-opacity-80 dark:outline-none dark:focus:bg-opacity-100"
          name="message"
          placeholder="Your message"
          required
          maxLength={5000}
        />
        <SubmitBtn />
      </form> */}

      <motion.div
        className="mt-5 flex flex-col items-center justify-center gap-2 px-4 text-lg font-medium sm:flex-row"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.1,
        }}
      >
        <button
          className="borderBlack group flex cursor-pointer items-center gap-2 rounded-full bg-white px-7 py-3 text-gray-700 outline-none transition hover:scale-110 focus:scale-110 active:scale-105 dark:bg-white/10 dark:text-white/60"
          onClick={copyEmail}
        >
          {/* <HiOutlineMail className="opacity-60 transition group-hover:translate-y-1" /> */}
          Fwdkrishna@gmail.com{" "}
        </button>

        <a
          className="borderBlack flex cursor-pointer items-center gap-2 rounded-full bg-white p-4 text-gray-700 transition hover:scale-[1.15] hover:text-gray-950 focus:scale-[1.15] active:scale-105 dark:bg-white/10 dark:text-white/60"
          href="https://linkedin.com/in/Technical-lead-ui-ux"
          target="_blank"
        >
          <BsLinkedin /> / Technical-lead-UI-UX
        </a>
      </motion.div>
    </motion.section>
  );
}
