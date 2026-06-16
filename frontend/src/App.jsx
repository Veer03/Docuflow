import Header from "./Header";
import Footer from "./Footer";
import Card from "./Card";
import Button from "./Button/Button";
import Student from "./Student";
import List from "./List";

function App() {
  const fruits = [
    { id: 1, name: "Apple", cal: 95 },
    { id: 2, name: "Banana", cal: 105 },
    { id: 3, name: "Cherry", cal: 50 },
    { id: 4, name: "Date", cal: 110 },
    { id: 5, name: "Elderberry", cal: 120 },
  ];
  const vegetables = [
    { id: 1, name: "Carrot", cal: 25 },
    { id: 2, name: "Broccoli", cal: 55 },
    { id: 3, name: "Spinach", cal: 20 },
    { id: 4, name: "Potato", cal: 150 },
    { id: 5, name: "Tomato", cal: 30 },
  ];
  return (
    <>
      <Header></Header>
      <Card />
      <br />
      <Student name="SpongeBob" age={30} isStudent={true} />
      <Student name="Patrick" age={40} isStudent={false} />
      <Student />
      {fruits.length > 0 ? <List items={fruits} category="All Fruits" /> : null}
      {vegetables.length > 0 ? (
        <List items={vegetables} category="All Vegetables" />
      ) : null}
      <Button />
      <Footer></Footer>
    </>
  );
}
export default App;
