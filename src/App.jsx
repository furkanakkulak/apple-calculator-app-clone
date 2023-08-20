import { useEffect, useRef, useState } from 'react';

export default function App() {
  const [firstNumber, setFirstNumber] = useState(null);
  const [secondNumber, setSecondNumber] = useState(null);
  const [operation, setOperation] = useState(null);
  const [result, setResult] = useState(0);
  const [clearType, setClearType] = useState('c');
  const [hoveredButton, setHoveredButton] = useState(null);
  const [copyText, setCopyText] = useState(false);
  const [fontSize, setFontSize] = useState(7);

  const resultRef = useRef(null);

  useEffect(() => {
    if (resultRef.current) {
      const resultElement = resultRef.current;
      const contentLength = resultElement.textContent.length;
      setFontSize(contentLength);
    }
  });

  useEffect(() => {
    const handleKeyboardInput = (event) => {
      const key = event.key;

      if (/[0-9]/.test(key)) {
        handleNumber(key);
        setHoveredButton(key);
        setTimeout(() => setHoveredButton(null), 300);
      } else if (key === '.') {
        handleNumber(key);
        setHoveredButton(key);
        setTimeout(() => setHoveredButton(null), 300);
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        handleOperation(key);
      } else if (key === 'Enter') {
        calculate();
      } else if (key === 'Backspace') {
        handleClearTypeToggle();
      }
    };

    window.addEventListener('keyup', handleKeyboardInput);

    return () => {
      window.removeEventListener('keyup', handleKeyboardInput);
    };
  }, [secondNumber, firstNumber]);

  const formatResult = (result) => {
    const formattedNumber = result.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });

    return formattedNumber.includes('.')
      ? formattedNumber.replace(/\.?0*$/, '')
      : formattedNumber;
  };

  const handleResultClick = () => {
    const textToCopy =
      secondNumber !== null
        ? secondNumber
        : firstNumber !== null
        ? firstNumber
        : result.toString();

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopyText(true);
        setTimeout(() => setCopyText(false), 1000);
        console.log('Text copied to clipboard:', textToCopy);
      })
      .catch((error) => {
        console.error('Failed to copy text to clipboard:', error);
      });
  };

  const handleNumber = (numberStr) => {
    if (operation) {
      if (
        secondNumber === null ||
        (secondNumber === '0' && numberStr !== '.')
      ) {
        if (secondNumber === null || secondNumber.length < 9) {
          setSecondNumber(numberStr);
        }
      } else if (
        secondNumber !== null &&
        secondNumber.length < 9 &&
        !(secondNumber.includes('.') && numberStr === '.')
      ) {
        setSecondNumber(secondNumber + numberStr);
      }
    } else {
      if (
        (firstNumber === null || firstNumber === '0' || result) &&
        numberStr !== '.'
      ) {
        setFirstNumber(numberStr);
        if (result) {
          setResult(0);
        }
      } else if (
        firstNumber !== null &&
        firstNumber.length < 9 &&
        !(firstNumber.includes('.') && numberStr === '.')
      ) {
        setFirstNumber(firstNumber + numberStr);
      }
    }
    setClearType('c');
  };

  const handleNegate = () => {
    if (secondNumber !== null) {
      setSecondNumber((-1 * parseFloat(secondNumber)).toString());
    } else if (firstNumber !== null) {
      setFirstNumber((-1 * parseFloat(firstNumber)).toString());
    }
  };

  const handlePercentage = () => {
    if (secondNumber !== null) {
      setSecondNumber((parseFloat(secondNumber) / 100).toString());
    } else if (firstNumber !== null) {
      setFirstNumber((parseFloat(firstNumber) / 100).toString());
    }
  };

  const handleOperation = (op) => {
    if (firstNumber !== null) {
      if (secondNumber === null) {
        setOperation(op);
        setSecondNumber('0');
      } else {
        calculate();
        setOperation(op);
      }
    }
  };

  const calculate = () => {
    if (firstNumber !== null && secondNumber !== null && operation) {
      let calculatedResult = 0;
      switch (operation) {
        case '+':
          calculatedResult = parseFloat(firstNumber) + parseFloat(secondNumber);
          break;
        case '-':
          calculatedResult = parseFloat(firstNumber) - parseFloat(secondNumber);
          break;
        case '*':
          calculatedResult = parseFloat(firstNumber) * parseFloat(secondNumber);
          break;
        case '/':
          calculatedResult = parseFloat(firstNumber) / parseFloat(secondNumber);
          break;
        default:
          calculatedResult = 0;
      }
      setResult(calculatedResult);
      setClearType('ac');

      const formattedResult = calculatedResult.toFixed(9);
      setFirstNumber(formattedResult);
      setSecondNumber(null);
      setOperation(null);
    }
  };

  const handleClearTypeToggle = () => {
    handleClear();
    if (clearType == 'c') {
      setClearType('ac');
    } else {
      setClearType('c');
    }
  };

  const handleClear = () => {
    if (clearType === 'c') {
      if (operation) {
        setSecondNumber('0');
      } else {
        setFirstNumber(null);
      }
    } else if (clearType === 'ac') {
      setFirstNumber(null);
      setSecondNumber(null);
      setOperation(null);
      setResult(0);
    }
    setClearType('c');
  };

  return (
    <div className="container">
      <div className={`copy-text ${copyText && 'show'}`}>
        Copied to clipboard
      </div>
      <div
        ref={resultRef}
        className={`result ${
          fontSize > 12
            ? 'text-4xl'
            : fontSize > 6
            ? 'text-6xl'
            : fontSize > 4
            ? 'text-7xl'
            : 'text-8xl'
        }`}
        onClick={handleResultClick}
      >
        {formatResult(
          secondNumber !== null
            ? parseFloat(secondNumber)
            : firstNumber !== null
            ? parseFloat(firstNumber)
            : result
        )}
      </div>
      <div className="calculator">
        <div className="box">
          <div
            className="option"
            onClick={handleClearTypeToggle}
          >
            {clearType === 'c' ? 'C' : 'AC'}
          </div>
        </div>
        <div className="box">
          <div
            className="option"
            onClick={handleNegate}
          >
            ±
          </div>
        </div>
        <div className="box">
          <div
            className="option"
            onClick={handlePercentage}
          >
            %
          </div>
        </div>
        <div className="box">
          <div
            className={`operation ${operation == '/' ? 'active' : ''}`}
            onClick={() => handleOperation('/')}
          >
            ÷
          </div>
        </div>
        <div className="box">
          <div
            className={`number ${hoveredButton === '7' ? 'hovered' : ''}`}
            onClick={() => handleNumber('7')}
          >
            7
          </div>
        </div>
        <div className="box">
          <div
            className={`number ${hoveredButton === '8' ? 'hovered' : ''}`}
            onClick={() => handleNumber('8')}
          >
            8
          </div>
        </div>
        <div className="box">
          <div
            className={`number ${hoveredButton === '9' ? 'hovered' : ''}`}
            onClick={() => handleNumber('9')}
          >
            9
          </div>
        </div>
        <div className="box">
          <div
            className={`operation ${operation == '*' ? 'active' : ''}`}
            onClick={() => handleOperation('*')}
          >
            ×
          </div>
        </div>
        <div className="box">
          <div
            className={`number ${hoveredButton === '4' ? 'hovered' : ''}`}
            onClick={() => handleNumber('4')}
          >
            4
          </div>
        </div>
        <div className="box">
          <div
            className={`number ${hoveredButton === '5' ? 'hovered' : ''}`}
            onClick={() => handleNumber('5')}
          >
            5
          </div>
        </div>
        <div className="box">
          <div
            className={`number ${hoveredButton === '6' ? 'hovered' : ''}`}
            onClick={() => handleNumber('6')}
          >
            6
          </div>
        </div>
        <div className="box">
          <div
            className={`operation ${operation == '-' ? 'active' : ''}`}
            onClick={() => handleOperation('-')}
          >
            -
          </div>
        </div>
        <div className="box">
          <div
            className={`number ${hoveredButton === '1' ? 'hovered' : ''}`}
            onClick={() => handleNumber('1')}
          >
            1
          </div>
        </div>
        <div className="box">
          <div
            className={`number ${hoveredButton === '2' ? 'hovered' : ''}`}
            onClick={() => handleNumber('2')}
          >
            2
          </div>
        </div>
        <div className="box">
          <div
            className={`number ${hoveredButton === '3' ? 'hovered' : ''}`}
            onClick={() => handleNumber('3')}
          >
            3
          </div>
        </div>
        <div className="box">
          <div
            className={`operation ${operation == '+' ? 'active' : ''}`}
            onClick={() => handleOperation('+')}
          >
            +
          </div>
        </div>
        <div className="box !col-span-2 !w-full !aspect-auto">
          <div
            className={`number !w-full ${
              hoveredButton === '0' ? 'hovered' : ''
            }`}
            onClick={() => handleNumber('0')}
          >
            0
          </div>
        </div>
        <div className="box">
          <div
            className={`number ${hoveredButton === '.' ? 'hovered' : ''}`}
            onClick={() => handleNumber('.')}
          >
            ,
          </div>
        </div>
        <div className="box">
          <div
            className="operation"
            onClick={calculate}
          >
            =
          </div>
        </div>
      </div>
    </div>
  );
}
