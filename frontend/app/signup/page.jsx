"use client";
import axios from "axios";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const un = useRef("");
  const em = useRef("");
  const wanumber = useRef("");
  const pass = useRef("");
  const conpass = useRef("");
  const fileref = useRef(null);

  const signup = async (e) => {
    e.preventDefault();
    const email = em.current.value;
    const whatsappnumber = wanumber.current.value;
    const name = un.current.value;
    const confirmpassword = conpass.current.value;
    const password = pass.current.value;
    if (fileref.current.files.length === 0) {
      toast.error("Please Upload Resume");
      return;
    }
    const file = fileref.current.files[0];

    if (confirmpassword === password) {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("wanumber", whatsappnumber);
      formData.append("file", file);

      const user = await axios
        .post("/api/candidate/signup", formData, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        })
        .catch((error) => {
          toast.error(error.response.data.message);
        });
      if (user) {
        toast.success(user.data.message);
        localStorage.setItem("token", user.data.token);
        localStorage.setItem("user", JSON.stringify(user.data.user));
        em.current.value = "";
        pass.current.value = "";
        conpass.current.value = "";
        un.current.value = "";
        wanumber.current.value = "";
        window.location = "/registerface";
      }
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    let token = localStorage.getItem("token");
    if (user && token) {
      if (!user.hasUserId) {
        router.push("/registerface");
      } else {
        router.push("/");
      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <section className="h-full bg-background">
        <div className=" h-full px-6 md:py-12 py-10">
          <div className="g-6 flex h-full flex-wrap items-center justify-center">
            {/* <!-- Left column container with background--> */}
            <div className="mb-12 md:mb-0 md:w-8/12 lg:w-6/12">
              <img
                src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                className="w-[80%] m-auto"
                alt=""
              />
            </div>

            {/* <!-- Right column container with form --> */}
            <div className="md:w-8/12 lg:ml-6 lg:w-5/12">
              <div className="text-foreground text-2xl p-4 mb-5">Signup</div>
              <form className="mb-5">
                <div className="flex justify-around">
                  {/* <!-- Name input --> */}
                  <div
                    className="relative mb-6 border border-gray-900 rounded-lg w-full mx-2"
                    data-te-input-wrapper-init
                  >
                    <input
                      type="text"
                      className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                      id="exampleFormControlInput3"
                      ref={un}
                      placeholder="UserName"
                    />
                    <label
                      htmlFor="exampleFormControlInput3"
                      className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out bg-background -translate-y-[1.15rem] scale-[0.8] text-primary peer-data-[te-input-state-active] bg-background:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:text-primary"
                    >
                      UserName
                    </label>
                  </div>
                  {/* <!-- Email input --> */}
                  <div
                    className="relative mb-6 border border-gray-900 rounded-lg w-full mx-2"
                    data-te-input-wrapper-init
                  >
                    <input
                      type="text"
                      className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                      id="exampleFormControlInput3"
                      ref={em}
                      placeholder="Email address"
                    />
                    <label
                      htmlFor="exampleFormControlInput3"
                      className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out bg-background -translate-y-[1.15rem] scale-[0.8] text-primary peer-data-[te-input-state-active] bg-background:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:text-primary"
                    >
                      Email address
                    </label>
                  </div>
                </div>
                <div className="flex justify-around">
                  {/* <!-- Password input --> */}
                  <div
                    className="relative mb-6 border border-gray-900 rounded-lg w-full mx-2"
                    data-te-input-wrapper-init
                  >
                    <input
                      type="password"
                      className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                      id="exampleFormControlInput33"
                      ref={pass}
                      placeholder="Password"
                    />
                    <label
                      htmlFor="exampleFormControlInput33"
                      className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out bg-background -translate-y-[1.15rem] scale-[0.8] text-primary peer-data-[te-input-state-active] bg-background:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:text-primary"
                    >
                      Password
                    </label>
                  </div>
                  {/* <!-- Password input --> */}
                  <div
                    className="relative mb-6 border border-gray-900 rounded-lg w-full mx-2"
                    data-te-input-wrapper-init
                  >
                    <input
                      type="password"
                      className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                      id="exampleFormControlInput33"
                      ref={conpass}
                      placeholder="Confirm Password"
                    />
                    <label
                      htmlFor="exampleFormControlInput33"
                      className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out bg-background -translate-y-[1.15rem] scale-[0.8] text-primary peer-data-[te-input-state-active] bg-background:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:text-primary"
                    >
                      Confirm Password
                    </label>
                  </div>
                </div>
                <div
                  className="relative mb-6 border border-gray-900 rounded-lg w-full mx-2"
                  data-te-input-wrapper-init
                >
                  <input
                    type="number"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                    id="exampleFormControlInput33"
                    ref={wanumber}
                    placeholder="8510002468"
                  />
                  <label
                    htmlFor="exampleFormControlInput33"
                    className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out bg-background -translate-y-[1.15rem] scale-[0.8] text-primary peer-data-[te-input-state-active] bg-background:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:text-primary"
                  >
                    Whatsapp Number
                  </label>
                </div>
                <div
                  className="relative mb-6 border border-gray-900 rounded-lg w-full mx-2"
                  data-te-input-wrapper-init
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                    id="exampleFormControlInput33"
                    ref={fileref}
                    placeholder=""
                  />
                  <label
                    htmlFor="exampleFormControlInput33"
                    className="pointer-events-none absolute px-2 py-0 left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate leading-[2.15] text-neutral-500 transition-all duration-200 ease-out bg-background -translate-y-[1.15rem] scale-[0.8] text-primary peer-data-[te-input-state-active] bg-background:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:text-primary"
                  >
                    Upload Resume
                  </label>
                </div>

                {/* <!-- Submit button --> */}
                <button
                  type="submit"
                  className="inline-block mt-5 w-full border rounded bg-foreground px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-background shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                  data-te-ripple-init
                  onClick={signup}
                  data-te-ripple-color="light"
                >
                  Sign up
                </button>

                {/* <!-- Divider --> */}
                <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                  <p className="mx-4 mb-0 text-center font-semibold dark:text-neutral-200">
                    OR
                  </p>
                </div>

                {/* <!-- Social login buttons --> */}
                <a
                  className="mb-3 border flex w-full items-center justify-center rounded bg-foreground px-7 pb-2.5 pt-3 text-center text-sm font-medium uppercase leading-normal text-background shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                  // style="background-color: #3b5998"
                  href="#!"
                  role="button"
                  data-te-ripple-init
                  data-te-ripple-color="light"
                >
                  {/* <!-- Facebook --> */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-3.5 w-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                  Continue with Facebook
                </a>
              </form>
              <div className="text-foreground">
                Have an Account?{" "}
                <Link
                  className="cursor-pointer text-blue-400 hover:text-blue-600"
                  href="/login"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
        <br />
      </section>
    </>
  );
}
