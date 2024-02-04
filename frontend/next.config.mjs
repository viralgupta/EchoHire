export default () => {
    const rewrites = () => {
        return [
            {
                source: "/api/candidate/signup",
                destination: "http://localhost:5000/api/candidate/signup",
            },
            {
                source: "/api/candidate/login",
                destination: "http://localhost:5000/api/candidate/login",
            },
            {
                source: "/api/candidate/registerface",
                destination: "http://localhost:5000/api/candidate/registerface",
            },
            {
                source: "/api/candidate/addinterest",
                destination: "http://localhost:5000/api/candidate/addinterest",
            },
            {
                source: "/api/candidate/submitreview",
                destination: "http://localhost:5000/api/candidate/submitreview",
            },
            {
                source: "/api/interviewee/getRoles",
                destination: "http://localhost:5000/api/interviewee/getRoles",
            },
            {
                source: "/api/interviewee/getRole",
                destination: "http://localhost:5000/api/interviewee/getRole",
            },
            {
                source: "/api/interviewee/addRole",
                destination: "http://localhost:5000/api/interviewee/addRole",
            },
            {
                source: "/api/interviewee/addAvailability",
                destination: "http://localhost:5000/api/interviewee/addAvailability",
            },
            {
                source: "/api/interviewee/removeAvailability",
                destination: "http://localhost:5000/api/interviewee/removeAvailability",
            },
            {
                source: "/api/interviewee/confirmuser",
                destination: "http://localhost:5000/api/interviewee/confirmuser",
            },
            {
                source: "/api/interviewee/submitreview",
                destination: "http://localhost:5000/api/interviewee/submitreview",
            },
        ];
    };
    return {
        rewrites,
        reactStrictMode: false
    };
};