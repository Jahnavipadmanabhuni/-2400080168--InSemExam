import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const student = {
    name: "Padmanabhuni Jahnavi",
    regNo: "2400080168",
    program: "B.Tech AI & DS",
    mobile: "6281079123",
  };

  return (
    <div className="container">
      <h1>Student Info</h1>

      <div className={`student-card ${isMobile ? "vertical" : "horizontal"}`}>
        <div className="student-field">
          <strong>Name:</strong> {student.name}
        </div>
        <div className="student-field">
          <strong>Reg No:</strong> {student.regNo}
        </div>
        <div className="student-field">
          <strong>Program:</strong> {student.program}
        </div>
        <div className="student-field">
          <strong>Mobile:</strong> {student.mobile}
        </div>
      </div>
    </div>
  );
}

export default App;
