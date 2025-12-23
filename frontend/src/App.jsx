import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <AppRoutes />
      <Footer />
    </>
  );
}

export default App;
