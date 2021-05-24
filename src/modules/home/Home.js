import React from 'react'
import './Home.css'
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Login from "./Login";
import SignUp from "./Signup";

function Home() {
    return (
            <div className="Home">
                <div className="auth-wrapper">
                    <div className="auth-inner">
                        <Login />
                    </div>
                </div>
            </div>
    );
}

function create(){
    
}

export default Home
