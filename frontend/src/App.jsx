import Header from "./Header";
import Footer from "./Footer";
import Card from "./Card";
import Button from "./Button/Button";
import Student from "./Student";

function App() {
  return (
    <>
      <Header></Header>
      <Card />
      <br />
      <Student name="SpongeBob" age={30} isStudent={true} />
      <Student name="Patrick" age={40} isStudent={true} />
      <Student />
      <Button />
      <Footer></Footer>
    </>
  );
}
export default App;
