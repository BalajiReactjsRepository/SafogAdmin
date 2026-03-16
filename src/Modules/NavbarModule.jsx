import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useNavigate } from "react-router-dom";
import Brand from "../Assets/Brand.png";
import Cookies from "js-cookie";
import { PiSignOutBold } from "react-icons/pi";

const NavbarModule = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove(process.env.REACT_APP_TOKEN);
    navigate("/login");
  };
  return (
    <Navbar expand='lg'>
      <Container>
        <Navbar.Brand className='fw-bold'>
          <img src={Brand} className='nav-logo' alt='logo' />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='ms-auto'>
            <Nav.Link onClick={handleLogout}>
              <PiSignOutBold className='logout-icon' />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarModule;
