import Header from "./Header";
import Footer from "./Footer";
import Card from "./Card";
import Button from "./Button/Button";
import Student from "./Student";
import List from "./List";

function App() {
  return (
    <>
      <Header></Header>
      <Card />
      <br />
      <Student name="SpongeBob" age={30} isStudent={true} />
      <Student name="Patrick" age={40} isStudent={false} />
      <Student />
      <List />
      <Button />
      <Footer></Footer>
    </>
  );
}
export default App;
