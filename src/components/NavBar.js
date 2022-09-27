import { Link } from "react-router-dom";

const NavBar = () => {
    return (
        <nav className="navbar">
            <div className="container">
            <a className="logo" href="/#">
                <img src="./BlackLogo.png" height="30" className="d-inline-block align-top" alt="" />
            </a>
        <ul className="navbar-nav">
            <li className="nav-item">
                <Link to="/">Inicio</Link>
            </li>
        </ul>
            </div>
        </nav>
    );
};

export default NavBar;