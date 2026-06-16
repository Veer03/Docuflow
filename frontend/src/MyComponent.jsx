import { useState } from "react";

function MyComponent() {
  const [name, setName] = useState("guest"); //initial state
  const [age, setAge] = useState(18);
  const updateName = () => {
    setName("Veer");
  };
  const incAge = () => {
    setAge(age + 1);
  };
  return (
    <div>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <button onClick={updateName}>Set Name</button>
      <button onClick={incAge}>Increase Age</button>
    </div>
  );
}
export default MyComponent;
