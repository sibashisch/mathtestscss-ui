'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var e = React.createElement;
var timerWarned = false;

var QuestionBox = function (_React$Component) {
  _inherits(QuestionBox, _React$Component);

  function QuestionBox(props) {
    _classCallCheck(this, QuestionBox);

    var _this = _possibleConstructorReturn(this, (QuestionBox.__proto__ || Object.getPrototypeOf(QuestionBox)).call(this, props));

    _this._tryToRetrieve = function () {
      try {
        var storedData = JSON.parse(localStorage.getItem(EXAM_SUMP_KEY + ':' + this.state.examid));
        if (storedData && storedData.USERNAME === _getUserData(USER_NAME_KEY) && storedData.EXAM === this.state.examid) {
          if ((new Date().getTime() - storedData.DUMPTIMEMILLIS) / 1000 > 2 * 60) {
            alert('You Were Away For More Than 5 Minutes, Submitting Exam.');
            this._finalSubmit('T');
          }
          this.setState(function (state) {
            return {
              started: 'Y',
              startTime: storedData.STARTTIME,
              answers: JSON.parse(storedData.ANSWERS),
              time: storedData.TIMELEFT,
              loading: 'N'
            };
          });
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
    };

    _this._crateExamDump = function () {
      var examDataDump = {};
      examDataDump['USERNAME'] = _getUserData(USER_NAME_KEY);
      examDataDump['DUMPTIME'] = new Date();
      examDataDump['DUMPTIMEMILLIS'] = new Date().getTime();
      examDataDump['STARTTIME'] = this.state.startTime;
      examDataDump['STARTTIMEMILLIS'] = new Date(this.state.startTime).getTime();
      examDataDump['EXAM'] = this.state.examid;
      examDataDump['ANSWERS'] = JSON.stringify(this.state.answers);
      examDataDump['TIMELEFT'] = this.state.time;
      return examDataDump;
    };

    _this._saveState = function () {
      if (this.state.started === 'N') return;
      try {
        var dataDump = this._crateExamDump();
        // let randomValidator = _generateExamDataValidationString();
        // dataDump.validator = randomValidator;
        // encrypt.setPublicKey(_getUserData(USER_ENCR_KEY));
        // localStorage.setItem(EXAM_SUMP_KEY + ':'+ this.state.examid, encrypt.encrypt(JSON.stringify(dataDump)));
        localStorage.setItem(EXAM_SUMP_KEY + ':' + this.state.examid, JSON.stringify(dataDump));
        localStorage.setItem(EXAM_SUMP_KEY + ':' + this.state.examid + ':id', _getUserData(USER_ENCR_ID_KEY));
        // localStorage.setItem(EXAM_SUMP_KEY + ':'+ this.state.examid + ':validator', sha256(randomValidator));
      } catch (err) {
        _logError(err);
      }
    };

    _this._startExam = function () {
      this.setState(function (state) {
        return { started: 'Y', startTime: new Date() };
      });
      this._saveState();
    };

    _this._finalSubmit = function (timeOut) {
      var _this2 = this;

      var finalStatus = this._crateExamDump();
      if (timeOut === 'Y') {
        alert('Time Up! Your Test Is Being Submitted');
      }
      if (timeOut === 'Y' || timeOut === 'T' || confirm('Are you sure?')) {
        this.setState(function (state) {
          return { loading: 'Exam Being Submitted. Please Don\'t Leave This Page.' };
        });
        var dataDump = this._crateExamDump();
        fetch(BASE_URL + '/exam/user/submit?message=' + encodeURIComponent(JSON.stringify(dataDump)), { method: 'POST', headers: { Authtoken: _getUserData(USER_AUTH_KEY) } }).then(function (res) {
          return res.json();
        }).then(function (result) {
          if (result && result.status && result.status === 'success') {
            try {
              localStorage.removeItem(EXAM_SUMP_KEY + ':' + _this2.state.examid);
              localStorage.removeItem(EXAM_SUMP_KEY + ':' + _this2.state.examid + ':id');
            } catch (err) {
              _logError(err);
            }
            _this2.setState(function (state) {
              return { submitted: 'S' };
            });
          } else {
            _this2.setState(function (state) {
              return { submitted: 'Exam Could Not be Submitted. ' + result.exception };
            });
          }
        }, function (error) {
          _logError(errr);
          _this2.setState(function (state) {
            return { submitted: 'X' };
          });
        });
      }
    };

    _this._submitExam = function () {
      this.setState(function (state) {
        return { submit: 'Y' };
      });
    };

    _this._returnToQues = function (quesIndex) {
      this.setState(function (state) {
        return { submit: 'N', questionIndex: quesIndex };
      });
    };

    _this._answerStatus = function () {
      var _this3 = this;

      var answerReview = {
        marginLeft: "2px",
        marginRight: "2px",
        paddingLeft: "5px",
        paddingRight: "5px"
      };

      var allAnswers = [];

      var _loop = function _loop(i) {
        var quesNumber = i + 1;
        var answer = _this3.state.answers[_this3.state.questions[i].quesid];
        if (answer) allAnswers.push(React.createElement(
          'button',
          { type: 'button', className: 'btn btn-primary', style: answerReview, key: quesNumber, onClick: function onClick() {
              return _this3._returnToQues(i);
            } },
          "Question " + quesNumber + ": " + answer
        ));else allAnswers.push(React.createElement(
          'button',
          { type: 'button', className: 'btn btn-warning', style: answerReview, key: quesNumber, onClick: function onClick() {
              return _this3._returnToQues(i);
            } },
          "Question " + quesNumber + ": Unanswered"
        ));
      };

      for (var i = 0; i < this.state.questions.length; i++) {
        _loop(i);
      }
      return allAnswers;
    };

    _this._convertIndexToOption = function (index) {
      if (index >= 26) return null;else return String.fromCharCode('A'.charCodeAt(0) + index);
    };

    _this._markAnswer = function (quesId, answer) {
      var modAnswers = this.state.answers;
      modAnswers[quesId] = answer;
      this.setState(function (state) {
        return {
          answers: modAnswers
        };
      });
      this._saveState();
    };

    _this._unMarkAnswer = function (quesId) {
      var modAnswers = this.state.answers;
      delete modAnswers[quesId];
      this.setState(function (state) {
        return {
          answers: modAnswers
        };
      });
      this._saveState();
    };

    _this._createAnserBox = function (quesId, optionCount) {
      var _this4 = this;

      if (optionCount <= 0) {
        return React.createElement('input', { type: 'text', className: 'form-control', id: 'answer-input', value: this.state.answers[quesId] });
      } else {
        var answerButtonStyle = {
          paddingLeft: "10px",
          paddingRight: "10px",
          marginLeft: "2px",
          marginRight: "2px",
          border: "1px solid lightgrey",
          borderRadius: "5px"
        };
        var options = [];

        var _loop2 = function _loop2(i) {
          var optionText = _this4._convertIndexToOption(i);
          if (_this4.state.answers[quesId] && _this4.state.answers[quesId] === optionText) {
            options.push(React.createElement(
              'button',
              { type: 'button', className: 'btn btn-primary', style: answerButtonStyle, key: i, onClick: function onClick() {
                  return _this4._markAnswer(quesId, optionText);
                } },
              'Option ' + _this4._convertIndexToOption(i)
            ));
          } else {
            options.push(React.createElement(
              'button',
              { type: 'button', className: 'btn btn-link', style: answerButtonStyle, key: i, onClick: function onClick() {
                  return _this4._markAnswer(quesId, optionText);
                } },
              "Option " + _this4._convertIndexToOption(i)
            ));
          }
        };

        for (var i = 0; i < optionCount; i++) {
          _loop2(i);
        }

        options.push(React.createElement(
          'button',
          { type: 'button', className: 'btn btn-link', style: answerButtonStyle, key: optionCount, onClick: function onClick() {
              return _this4._unMarkAnswer(quesId);
            } },
          'Clear'
        ));

        return options;
      }
    };

    _this._navigateToQuesIndex = function (index) {
      this.setState(function (state) {
        return { questionIndex: index };
      });
    };

    _this._createNavigationBox = function () {
      var _this5 = this;

      var allNavigations = [];

      var _loop3 = function _loop3(i) {
        if (_this5.state.questionIndex === i) {
          allNavigations.push(React.createElement(
            'button',
            { type: 'button', className: 'btn btn-primary', key: i, onClick: function onClick() {
                return _this5._navigateToQuesIndex(i);
              } },
            i + 1
          ));
        } else {
          allNavigations.push(React.createElement(
            'button',
            { type: 'button', className: 'btn btn-link', key: i, onClick: function onClick() {
                return _this5._navigateToQuesIndex(i);
              } },
            i + 1
          ));
        }
      };

      for (var i = 0; i < this.state.questions.length; i++) {
        _loop3(i);
      }
      allNavigations.push(React.createElement(
        'button',
        { type: 'button', className: 'btn btn-success', key: this.state.questions.length, onClick: function onClick() {
            return _this5._submitExam();
          } },
        'Submit \u2192'
      ));
      return allNavigations;
    };

    _this._getImageURL = function (imageKey) {
      if (this.state.withpic === 'Y') return "data:image/jpg;base64, " + this.state.imagedata[imageKey];else return BASE_URL + "/image/get/" + image;
    };

    _this._niceString = function (number) {
      if (number.toString().length === 1) return '0' + number.toString();else return number.toString();
    };

    _this._clear = function () {
      if (confirm('Are you sure? You will never be able to submit this exam again')) {
        try {
          localStorage.removeItem(EXAM_SUMP_KEY + ':' + this.state.examid);
          localStorage.removeItem(EXAM_SUMP_KEY + ':' + this.state.examid + ':id');
        } catch (err) {
          _logError(err);
        }
      }
    };

    _this.state = { questions: props.questions, answers: {}, questionIndex: 0, withpic: props.withpic,
      imagedata: props.imagedata, submit: 'N', started: 'N', examid: props.examid, time: props.time * 60,
      duration: props.time, name: props.name, instructions: props.instructions, loading: 'N', submitted: 'N' };
    return _this;
  }

  _createClass(QuestionBox, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this6 = this;

      this._tryToRetrieve();
      this.myInterval = setInterval(function () {
        if (_this6.state.started !== 'N') {
          var timeToGo = _this6.state.time - TIMER_INTERVAL;
          if (timeToGo < 0) {
            clearTimeout(_this6.myInterval);
            _this6._finalSubmit('Y');
          } else {
            _this6._saveState();
            _this6.setState(function (state) {
              return { time: timeToGo };
            });
          }

          if (timeToGo < TIMER_WARNING * 60 && !timerWarned) {
            timerWarned = true;
            alert('Warning! Less than ' + TIMER_WARNING + ' minutes to go.');
          }
        }
      }, 1000 * TIMER_INTERVAL);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this7 = this;

      var question = this.state.questions[this.state.questionIndex];
      var questionImageStyle = {
        width: "90%",
        height: "auto"
      };
      var containerStyle = {
        textAlign: "center"
      };

      if (this.state.submitted === 'S') {
        return React.createElement(
          'div',
          null,
          'Exam Successfully Submitted. Click ',
          React.createElement(
            'a',
            { href: '{USER_HOME}' },
            'Here'
          ),
          ' To Go back.'
        );
      } else if (this.state.submitted === 'X') {
        return React.createElement(
          'div',
          null,
          'Some Error Occurred. Refresh Page To Submit Again. If Problem Persists, Contact Your Paper Setter. ',
          React.createElement('br', null),
          React.createElement('br', null),
          React.createElement(
            'button',
            { type: 'button', className: 'btn btn-danger', onClick: function onClick() {
                return _this7._clear();
              } },
            'Delete Exam Data'
          )
        );
      } else if (this.state.submitted !== 'N') {
        return React.createElement(
          'div',
          { style: { color: 'blue' } },
          this.state.submitted,
          React.createElement('br', null),
          React.createElement('br', null),
          React.createElement(
            'button',
            { type: 'button', className: 'btn btn-danger', onClick: function onClick() {
                return _this7._clear();
              } },
            'Delete Exam Data'
          )
        );
      } else if (this.state.loading !== 'N') {
        return React.createElement(
          'div',
          null,
          this.state.loading,
          ' ',
          React.createElement('br', null),
          React.createElement('img', { src: 'resources/images/loader.gif', alr: 'Loading' })
        );
      } else if (this.state.started === 'N') {
        return React.createElement(
          'div',
          null,
          React.createElement('br', null),
          React.createElement(
            'h5',
            null,
            this.state.name
          ),
          React.createElement('br', null),
          React.createElement(
            'b',
            null,
            'Time:'
          ),
          ' ',
          this.state.duration,
          ' minutes',
          React.createElement('br', null),
          React.createElement(
            'b',
            null,
            'Instructions:'
          ),
          React.createElement('br', null),
          this.state.instructions.split('\n').map(function (i) {
            return React.createElement(
              'p',
              { key: i },
              i
            );
          }),
          React.createElement('br', null),
          React.createElement('hr', null),
          'Please Note: Once Started, timer will start and if you leave the window, you may not be able to resume again. ',
          React.createElement('br', null),
          React.createElement(
            'button',
            { type: 'button', className: 'btn btn-primary', onClick: function onClick() {
                return _this7._startExam();
              }, style: { float: 'right' } },
            'I Understand, Start Exam \u2192'
          )
        );
      } else if (this.state.submit === 'N') {
        return React.createElement(
          'div',
          { style: containerStyle },
          React.createElement(
            'p',
            { style: { float: 'right' } },
            'Time Left: ',
            this._niceString(Math.floor(this.state.time / 60)),
            ':',
            this._niceString(this.state.time % 60)
          ),
          React.createElement('br', null),
          React.createElement(
            'h5',
            { id: 'question-desc' },
            question.desc
          ),
          ' ',
          React.createElement('br', null),
          React.createElement('img', { src: this._getImageURL(question.image), alt: question.desc, style: questionImageStyle }),
          React.createElement('br', null),
          React.createElement('br', null),
          this._createAnserBox(question.quesid, question.optioncount),
          ' ',
          React.createElement('hr', null),
          this._createNavigationBox()
        );
      } else {
        return React.createElement(
          'div',
          null,
          React.createElement(
            'p',
            { style: { float: 'right' } },
            'Time Left: ',
            this._niceString(Math.floor(this.state.time / 60)),
            ':',
            this._niceString(this.state.time % 60)
          ),
          React.createElement('br', null),
          this._answerStatus(),
          React.createElement('br', null),
          React.createElement('br', null),
          React.createElement(
            'button',
            { type: 'button', className: 'btn btn-success', style: { float: "right" }, onClick: function onClick() {
                return _this7._finalSubmit('N');
              } },
            'Confirm Submit \u2192'
          ),
          React.createElement('br', null),
          React.createElement('br', null),
          React.createElement('hr', null),
          React.createElement(
            'p',
            { className: 'text-muted', style: { textAlign: "left", float: "left" } },
            '* Click on a button to return to that question.'
          )
        );
      }
    }
  }]);

  return QuestionBox;
}(React.Component);