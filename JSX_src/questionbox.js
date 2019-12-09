'use strict';

const e = React.createElement;
let timerWarned = false;

class QuestionBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {questions:props.questions, answers:{}, questionIndex:0, withpic:props.withpic, 
                  imagedata:props.imagedata, submit:'N', started: 'N', examid:props.examid, time:props.time*60,
                  duration:props.time, name:props.name, instructions:props.instructions, loading:'N', submitted: 'N'};
  }

  _tryToRetrieve = function () {
    try {
      let storedData = JSON.parse(localStorage.getItem(EXAM_SUMP_KEY + ':'+ this.state.examid));
      if (storedData && storedData.USERNAME === _getUserData(USER_NAME_KEY) && storedData.EXAM === this.state.examid) {
        if (((new Date().getTime() - storedData.DUMPTIMEMILLIS) / 1000) > (2 * 60)) {
          alert ('You Were Away For More Than 5 Minutes, Submitting Exam.');
          this._finalSubmit('T');
        }
        this.setState(state => ({
            started: 'Y',
            startTime: storedData.STARTTIME,
            answers: JSON.parse(storedData.ANSWERS),
            time: storedData.TIMELEFT,
            loading: 'N'
          })
        );
      }
    } catch (err) {
      _logError(err);
    }
      /*
      let storedDataKeyId = localStorage.getItem(EXAM_SUMP_KEY + ':'+ this.state.examid + ':id');
      let validatorStr = localStorage.getItem(EXAM_SUMP_KEY + ':'+ this.state.examid + ':validator');
      if (storedDataKeyId && storedDataEncr && validatorStr) {
        this.setState(state => ({ loading: 'Please Wait, Trying To Pickup From Where You Left.' }));
        fetch (`${BASE_URL}/validate/decr/${storedDataKeyId}?message=${encodeURIComponent(storedDataEncr)}&validator=${validatorStr}&submission=N`, 
              {headers: {Authtoken: _getUserData(USER_AUTH_KEY)}})
        .then(res => res.json())
        .then((result) => {
          if (result.status && result.status === 'success') {
            let storedData = JSON.parse(result.clearmessage);
            if (storedData && storedData.USERNAME === _getUserData(USER_NAME_KEY) && storedData.EXAM === this.state.examid) {
              this.setState(state => ({
                  started: 'Y',
                  startTime: storedData.STARTTIME,
                  answers: JSON.parse(storedData.ANSWERS),
                  time: storedData.TIMELEFT,
                  loading: 'N'
                })
              );
            } else {
              this.setState(state => ({ loading:'N' }));
            }
          } else {
            this.setState(state => ({ loading:'N' }));
            _logError(result);
          }
        }, (error) => {
          this.setState(state => ({ loading:'N' }));
          _logError(error);
          _logError(result);
        });
      }
      */
  }

  componentDidMount() {

    this._tryToRetrieve();
    this.myInterval = setInterval(() => {
      if (this.state.started !== 'N') {
        let timeToGo = this.state.time - TIMER_INTERVAL;
        if (timeToGo < 0) {
          clearTimeout(this.myInterval);
          this._finalSubmit('Y');
        } else {
          this._saveState();
          this.setState(state => ({time: timeToGo}));
        }

        if (timeToGo < TIMER_WARNING*60 && !timerWarned) {
          timerWarned = true;
          alert ('Warning! Less than ' + TIMER_WARNING + ' minutes to go.');
        }
      }
    }, 1000*TIMER_INTERVAL);
  }

  _crateExamDump = function() {
    let examDataDump = {};
    examDataDump['USERNAME'] = _getUserData(USER_NAME_KEY);
    examDataDump['DUMPTIME'] = new Date();
    examDataDump['DUMPTIMEMILLIS'] = new Date().getTime();
    examDataDump['STARTTIME'] = this.state.startTime;
    examDataDump['STARTTIMEMILLIS'] = new Date(this.state.startTime).getTime();
    examDataDump['EXAM'] = this.state.examid;
    examDataDump['ANSWERS'] = JSON.stringify(this.state.answers);
    examDataDump['TIMELEFT'] = this.state.time;
    return examDataDump;
  }

  _saveState = function() {
    if (this.state.started === 'N') return;
    try {
      let dataDump = this._crateExamDump();
      // let randomValidator = _generateExamDataValidationString();
      // dataDump.validator = randomValidator;
      // encrypt.setPublicKey(_getUserData(USER_ENCR_KEY));
      // localStorage.setItem(EXAM_SUMP_KEY + ':'+ this.state.examid, encrypt.encrypt(JSON.stringify(dataDump)));
      localStorage.setItem(EXAM_SUMP_KEY + ':'+ this.state.examid, JSON.stringify(dataDump));
      localStorage.setItem(EXAM_SUMP_KEY + ':'+ this.state.examid + ':id', _getUserData(USER_ENCR_ID_KEY));
      // localStorage.setItem(EXAM_SUMP_KEY + ':'+ this.state.examid + ':validator', sha256(randomValidator));
      
    } catch (err) {
      _logError(err);
    }
  }

  _startExam = function() {
    this.setState(state => ({started: 'Y', startTime: new Date()}));
    this._saveState();
  }

  _finalSubmit = function(timeOut) {
    let finalStatus = this._crateExamDump();
    if (timeOut === 'Y') {
      alert ('Time Up! Your Test Is Being Submitted');
    } 
    if (timeOut === 'Y' || timeOut === 'T' || confirm('Are you sure?')) {
      this.setState(state => ({ loading: 'Exam Being Submitted. Please Don\'t Leave This Page.' }));
      let dataDump = this._crateExamDump();
      fetch(`${BASE_URL}/exam/user/submit?message=${encodeURIComponent(JSON.stringify(dataDump))}`, 
        {method: 'POST', headers: {Authtoken: _getUserData(USER_AUTH_KEY)}})
        .then(res => res.json())
        .then((result) => {
          if (result && result.status && result.status === 'success') {
            try {
              localStorage.removeItem(EXAM_SUMP_KEY + ':'+ this.state.examid);
              localStorage.removeItem(EXAM_SUMP_KEY + ':'+ this.state.examid + ':id');
            } catch (err) {
              _logError(err);
            }
            this.setState(state => ({submitted: 'S'}));
          } else {
            this.setState(state => ({submitted: 'Exam Could Not be Submitted. ' + result.exception}));
          }
        }, (error) => {
          _logError(errr);
          this.setState(state => ({submitted: 'X'}));
        });
      
    }  
  }

  _submitExam = function () {
    this.setState(state => ({submit: 'Y'}));
  }

  _returnToQues = function (quesIndex) {
    this.setState(state => ({submit: 'N', questionIndex: quesIndex}));
  } 

  _answerStatus = function () {
    const answerReview = {
      marginLeft: "2px",
      marginRight: "2px",
      paddingLeft: "5px",
      paddingRight: "5px"
    };

    let allAnswers = [];
    for (let i=0; i<this.state.questions.length; i++) {
      let quesNumber = i + 1;
      let answer = this.state.answers[this.state.questions[i].quesid];
      if (answer)
        allAnswers.push(
            <button type="button" className="btn btn-primary" style={answerReview} key={quesNumber} onClick={() => this._returnToQues(i)}>
              {"Question " + quesNumber + ": " + answer}
            </button>
          );
      else
        allAnswers.push(
            <button type="button" className="btn btn-warning" style={answerReview} key={quesNumber} onClick={() => this._returnToQues(i)}>
              {"Question " + quesNumber + ": Unanswered"}
            </button>
          );
    }
    return allAnswers;
  }

  _convertIndexToOption = function (index) {
    if (index >= 26) 
      return null;
    else
      return String.fromCharCode('A'.charCodeAt(0) + index);
  }

  _markAnswer = function (quesId, answer) {
    let modAnswers = this.state.answers;
    modAnswers[quesId] = answer;
    this.setState(state => ({
      answers: modAnswers
    }));
    this._saveState();
  }

  _unMarkAnswer = function (quesId) {
    let modAnswers = this.state.answers;
    delete modAnswers[quesId];
    this.setState(state => ({
      answers: modAnswers
    }));
    this._saveState();
  }

  _createAnserBox = function (quesId, optionCount) {
    if (optionCount <= 0) {
      return <input type="text" className="form-control" id="answer-input" value={this.state.answers[quesId]} />;
    } else {
      const answerButtonStyle = {
        paddingLeft: "10px",
        paddingRight: "10px",
        marginLeft: "2px",
        marginRight: "2px",
        border: "1px solid lightgrey",
        borderRadius: "5px"
      };
      let options = [];
      for (let i=0; i<optionCount; i++) {
        let optionText = this._convertIndexToOption(i);
        if (this.state.answers[quesId] && this.state.answers[quesId]===optionText) {
          options.push (
              <button type="button" className="btn btn-primary" style={answerButtonStyle} key={i} onClick={() => this._markAnswer(quesId, optionText)}> 
                {'Option ' + this._convertIndexToOption(i)} 
              </button>
            );
        } else {
          options.push (
              <button type="button" className="btn btn-link" style={answerButtonStyle} key={i} onClick={() => this._markAnswer(quesId, optionText)}>
                {"Option " + this._convertIndexToOption(i)}
              </button>
            );
        } 
      }

      options.push (
          <button type="button" className="btn btn-link" style={answerButtonStyle} key={optionCount} onClick={() => this._unMarkAnswer(quesId)}>
            Clear
          </button>
        );

      return options;
    }
  }

  _navigateToQuesIndex = function (index) {
    this.setState(state => ({questionIndex: index}));
  }

  _createNavigationBox = function() {
    let allNavigations = [];
    for (let i=0; i<this.state.questions.length; i++) {
      if (this.state.questionIndex === i) {
        allNavigations.push(<button type="button" className="btn btn-primary" key={i} onClick={() => this._navigateToQuesIndex(i)}>{i+1}</button>);
      } else {
        allNavigations.push(<button type="button" className="btn btn-link" key={i} onClick={() => this._navigateToQuesIndex(i)}>{i+1}</button>);
      }
    }
    allNavigations.push(
        <button type="button" className="btn btn-success" key={this.state.questions.length} onClick={() => this._submitExam()}>
          Submit &rarr;
        </button>
      );
    return allNavigations;
  }

  _getImageURL = function (imageKey) {
    if (this.state.withpic === 'Y') 
      return ("data:image/jpg;base64, " + this.state.imagedata[imageKey]);
    else 
      return (BASE_URL + "/image/get/" + image);
  }

  _niceString = function (number) {
    if (number.toString().length === 1)
      return '0'+number.toString();
    else
      return number.toString();
  }

  _clear = function () {
    if (confirm('Are you sure? You will never be able to submit this exam again')) {
      try {
        localStorage.removeItem(EXAM_SUMP_KEY + ':'+ this.state.examid);
        localStorage.removeItem(EXAM_SUMP_KEY + ':'+ this.state.examid + ':id');
      } catch (err) {
        _logError(err);
      }
    }
  }

  render() {
    let question = this.state.questions[this.state.questionIndex];
    const questionImageStyle = {
      width: "90%",
      height: "auto"
    };
    const containerStyle = {
      textAlign: "center"
    };

    if (this.state.submitted === 'S') {
      return (<div>Exam Successfully Submitted. Click <a href="{USER_HOME}">Here</a> To Go back.</div>);
    } else if (this.state.submitted === 'X') {
      return (
        <div>
          Some Error Occurred. Refresh Page To Submit Again. If Problem Persists, Contact Your Paper Setter. <br /><br />
          <button type="button" className="btn btn-danger" onClick={() => this._clear()}>Delete Exam Data</button>
        </div>
      );
    } else if (this.state.submitted !== 'N') {
      return (
        <div style={{color: 'blue'}}>
          {this.state.submitted}<br /><br />
          <button type="button" className="btn btn-danger" onClick={() => this._clear()}>Delete Exam Data</button>
        </div>
      );
    } else if (this.state.loading !== 'N') {
      return (
        <div>
          {this.state.loading} <br />
          <img src="resources/images/loader.gif" alr="Loading" />
        </div>
      );
    } else if (this.state.started === 'N') {
      return (
        <div>
          <br />
          <h5>{this.state.name}</h5><br />
          <b>Time:</b> {this.state.duration} minutes<br />
          <b>Instructions:</b><br />
          {this.state.instructions.split('\n').map(i =><p key={i}>{i}</p>)}<br />
          <hr />
          Please Note: Once Started, timer will start and if you leave the window, you may not be able to resume again. <br />
          <button type="button" className="btn btn-primary" onClick={() => this._startExam()} style={{float: 'right'}}>
            I Understand, Start Exam &rarr;
          </button>
        </div>
      );
    } else if (this.state.submit === 'N') {
      return (
        <div style={containerStyle}>
          <p style={{float: 'right'}}>
            Time Left: {this._niceString(Math.floor(this.state.time/60))}:{this._niceString(this.state.time%60)}
          </p><br />
          <h5 id="question-desc">{question.desc}</h5> <br />
          <img src={this._getImageURL(question.image)} alt={question.desc} style={questionImageStyle} /><br /><br />
          {this._createAnserBox(question.quesid, question.optioncount)} <hr />
          {this._createNavigationBox()}
        </div>
      );
    } else {
      return (
        <div>
          <p style={{float: 'right'}}>
            Time Left: {this._niceString(Math.floor(this.state.time/60))}:{this._niceString(this.state.time%60)}
          </p><br />
          {this._answerStatus()}
          <br /><br />
          <button type="button" className="btn btn-success" style={{float: "right"}} onClick={() => this._finalSubmit('N')}>
            Confirm Submit &rarr;
          </button>
          <br /><br />
          <hr />
          <p className="text-muted" style={{textAlign: "left", float: "left"}}>* Click on a button to return to that question.</p>
        </div>
      );
    }
  }
}