"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from "react";
import { toast } from "sonner"

const Page = () => {
  const router = useRouter()
  const em = useRef('')
  const pass = useRef('')
  const login = async (e) => {
    e.preventDefault()
    const email = em.current.value;
    const password = pass.current.value;
    const user = await axios.post('/api/candidate/login', {
      email: email,
      password: password
    }, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420"
      }
    }).catch((error) => {
      toast.error(error.response.data.message);
    })
    if (user) {
      toast.success(user.data.message);
      localStorage.setItem("token", user.data.token)
      localStorage.setItem("user", JSON.stringify(user.data.user))
      em.current.value = ''
      pass.current.value = ''
      if(user.data.hasUserId){
        window.location = "/"
      }
      else{
        window.location = "/registerface"
      }
    }
  }
  const guestlogin = async (e) => {
    e.preventDefault()
    const email = "guest@guestmail.com"
    const password = "guestpass";
    const user = await axios.post('/api/candidate/login', {
      email: email,
      password: password
    }, {
      "Content-Type": "application/json"
    }).catch((error) => {
      toast.error(error.response.data.message);
    })
    if (user) {
      toast.success(user.data.message);
      localStorage.setItem("token", user.data.token)
      localStorage.setItem("user", JSON.stringify(user.data.user))
      em.current.value = ''
      pass.current.value = ''
      if(user.hasUserId){
        window.location = "/"
      }
      else{
        window.location = "/registerface"
      }
    }
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem('token');
    if (user && token) {
      if (!user.hasUserId) {
        router.push("/registerface")
      }
      else {
        router.push('/')
      }
    }
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <section className="h-full bg-background">
        <div className=" h-full px-6 md:py-12 py-10">
          <div
            className="g-6 flex h-full flex-wrap items-center justify-center">
            {/* <!-- Left column container with background--> */}
            <div className="mb-12 md:mb-0 md:w-8/12 lg:w-6/12">
              <img src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg" className="w-[80%] m-auto " alt="" />
            </div>

            {/* <!-- Right column container with form --> */}
            <div className="md:w-8/12 lg:ml-6 lg:w-5/12">
              <div className="text-foreground text-2xl p-4 mb-5">Login</div>
              <form >
                {/* <!-- Email input --> */}
                <div className="relative mb-6 border border-border rounded-lg w-full mx-2" data-te-input-wrapper-init>
                  <input
                    type="text"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                    id="exampleFormControlInput3"
                    placeholder="Email address"
                    ref={em}
                  />
                  <label
                    htmlFor="exampleFormControlInput3"
                    className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out bg-background -translate-y-[1.15rem] scale-[0.8] text-primary peer-data-[te-input-state-active]:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:text-primary"
                  >Email address
                  </label>
                </div>

                {/* <!-- Password input --> */}
                <div className="relative mb-6 border border-border rounded-lg w-full mx-2" data-te-input-wrapper-init>
                  <input
                    type="password"
                    className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[2.15] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                    id="exampleFormControlInput33"
                    ref={pass}
                    placeholder="Password" />
                  <label
                    htmlFor="exampleFormControlInput33"
                    className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[2.15] text-neutral-500 transition-all duration-200 ease-out bg-background -translate-y-[1.15rem] scale-[0.8] text-primary peer-data-[te-input-state-active]:-translate-y-[1.15rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:text-primary"
                  >Password
                  </label>
                </div>

                {/* <!-- Remember me checkbox --> */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]">
                    <input
                      className="relative float-left -ml-[1.5rem] mr-[6px] mt-[0.15rem] h-[1.125rem] w-[1.125rem] appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                      type="checkbox"
                      value=""
                      id="exampleCheck3"
                    />
                    <label
                      className="inline-block pl-[0.15rem] hover:cursor-pointer text-foreground"
                      htmlFor="exampleCheck3">
                      Remember me
                    </label>
                  </div>

                  {/* <!-- Forgot password link --> */}
                  <a
                    href="#!"
                    className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
                  >Forgot password?</a>
                </div>

                {/* <!-- Submit button --> */}
                <div className="flex">
                  <button
                    type="submit"
                    className="inline-block m-1 w-full border rounded bg-foreground px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-background shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    data-te-ripple-init
                    data-te-ripple-color="light"
                    onClick={login}
                  >
                    Sign in
                  </button>
                  <button
                    type="submit"
                    className="inline-block w-full m-1 border rounded bg-foreground px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-background shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    data-te-ripple-init
                    data-te-ripple-color="light"
                    onClick={guestlogin}
                  >
                    Sign in as Guest
                  </button>
                </div>

                {/* <!-- Divider --> */}
                <div
                  className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300">
                  <p
                    className="mx-4 mb-0 text-center font-semibold dark:text-neutral-200">
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
                  data-te-ripple-color="light">
                  {/* <!-- Facebook --> */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-3.5 w-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                  Continue with Facebook
                </a>
              </form>
              <div className="text-foreground">
                Dont have an Account? <Link className="cursor-pointer text-blue-400 hover:text-blue-600" href="/signup">Signup</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Page