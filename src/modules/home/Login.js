import React, { Component } from "react";
import { Link } from "react-router-dom";
export default class Login extends Component {
    render() {
        return (
            <div>
                <h3>Đăng Nhập Showroom 3D</h3>

                <div className="form-group">
                    <label>Tên Đăng Nhập</label>
                    <input type="email" className="form-control" placeholder="Điền Tên Đăng Nhập" />
                </div>

                <div className="form-group">
                    <label>Mật Khẩu</label>
                    <input type="password" className="form-control" placeholder="Điền Mật Khẩu" />
                </div>

                {/*<div className="form-group">*/}
                {/*    <div className="custom-control custom-checkbox">*/}
                {/*        <input type="checkbox" className="custom-control-input" id="customCheck1" />*/}
                {/*        <label className="custom-control-label" htmlFor="customCheck1">Remember me</label>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <Link to="/showroom">
                    <button className="btn btn-primary btn-block">Đăng Nhập</button>
                </Link>
                {/*<p className="forgot-password text-right">*/}
                {/*    Forgot <a href="#">password?</a>*/}
                {/*</p>*/}
            </div>
        );
    }
}