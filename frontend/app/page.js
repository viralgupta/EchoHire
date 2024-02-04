"use client";
import axios from "axios";
import Link from "next/link";

export default function Home() {
  return (
    <section className="text-foreground body-font bg-background h-full">
      <div className="h-3/5 flex justify-center p-20 py-5">
        <div className="h-full w-1/2">
          <div className="font-cubano text-8xl">Next Generation Hiring</div>
          <div className="text-xl font-sofiapro">Forget the old rules. You can have the best people. <br />Right now. Right here.</div>
          <a href="#iam">
            <button href="#iam" className="bg-foreground text-background px-5 py-2 rounded-full mt-16">Get Started</button>
          </a>
        </div>
        <div className="h-full w-1/2">
          <img src={'https://res.cloudinary.com/upwork-cloud-acquisition-prod/image/upload/c_scale,w_580,h_395,f_auto,q_auto,dpr_2.0/brontes/hero/searching-talent@2x.png'} alt="cover" />
        </div>
      </div>
      <div id="iam" className="h-2/5 w-full flex justify-around align-top items-start p-5">
        <Link href={'/candidate'} className="font-cubano text-xl h-min px-5 py-2 border-4 border-foreground hover:bg-foreground hover:text-background duration-500">I am a Candidate</Link>
        <Link href={'/interviewer'} className="font-cubano text-xl h-min px-5 py-2 border-4 border-foreground hover:bg-foreground hover:text-background duration-500">I am a Interviewer</Link>
      </div>
    </section>
  )
}
