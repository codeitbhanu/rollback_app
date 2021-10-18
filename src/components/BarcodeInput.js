import React from "react";

function BarcodeInput() {
    return (
        <div className="grid">
            <form
                action="https://httpbin.org/post"
                method="POST"
                className="form login"
            >
                <div className="form__field">
                    <label htmlFor="login__username">
                        <svg className="icon">
                            <svg
                                width="1em"
                                height="1em"
                                viewBox="0 0 16 16"
                                className="bi bi-play-fill"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                            </svg>
                            <span className="hidden">Username</span>
                        </svg>
                    </label>
                    <input
                        id="data"
                        type="text"
                        name="username"
                        className="form__input"
                        placeholder="Enter URL here"
                        required
                    />
                </div>
                <div className="form__field">
                    <input
                        type="submit"
                        defaultValue="DOWNLOAD"
                        onclick="yt()"
                    />
                </div>
            </form>
            <p className="text--center">
                Want help? <a href="#"> Learn now</a>{" "}
                <svg className="icon">
                    <use
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        xlinkHref="assets/images/icons.svg#arrow-right"
                    />
                </svg>
            </p>
        </div>
    );
}

export default BarcodeInput;
