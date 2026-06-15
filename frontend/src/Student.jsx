import PropTypes from "prop-types";
function Student(props) {
  //..........
  const notStudentMess = <h1>Sorry, {props.name} is not a student.</h1>;
  //props
  if (!props.isStudent) {
    return <div>{notStudentMess}</div>;
  }
  return (
    <div className="student-card">
      <p>Name: {props.name}</p>
      <p>Age: {props.age}</p>
      <p>Student: {props.isStudent ? "Yes" : "No"}</p>
    </div>
  );
}
//props types and default props
Student.propTypes = {
  name: PropTypes.string,
  age: PropTypes.number,
  isStudent: PropTypes.bool,
};
Student.defaultProps = {
  name: "Unknown",
  age: 0,
  isStudent: false,
};
export default Student;
