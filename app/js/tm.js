class TmApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: []
    };
    this.tasksUpdate = this.tasksUpdate.bind(this);
  }

  componentDidMount() {
    this._getTasksFromStorage();
  }

  render() {
    return (
      <section>
        <div className="header">
          <h2 className="title">Todo list</h2>
          <TmRemove tasks={this.state.tasks} tasksUpdate={this.tasksUpdate} />
        </div>

        <TmList tasks={this.state.tasks} tasksUpdate={this.tasksUpdate} />
        <TmTask tasks={this.state.tasks} tasksUpdate={this.tasksUpdate} action="newTask" />
      </section>
    );
  }

  tasksUpdate() {
    this._getTasksFromStorage();
    this.render();
  }

  _getTasksFromStorage() {
    if(typeof localStorage.tasks === 'undefined') {
      localStorage.tasks = '[]';
    }
    this.setState({
      tasks: JSON.parse(localStorage.tasks)
    });
  }
}

class TmRemove extends React.Component {
  constructor(props) {
    super(props);
    this.handleRemove = this.handleRemove.bind(this);
  }

  render() {
    const count = this.props.tasks.filter(task=>task.done==true).length;
    if(count==0) return ("");
    return (
      <div className="tasks-remove" onClick={this.handleRemove}>
        Remove computed tasks({count})
      </div>
    );
  }

  handleRemove () {
    let new_array = this.props.tasks.filter(task=>task.done==false);
    localStorage.tasks = JSON.stringify( new_array );
    this.props.tasksUpdate();
  }
}

class TmList extends React.Component {
  render() {
    return (
      <div className="tasks-container">
        {this.props.tasks.map(task => (
          <TmTask key={task.id} settings={task} tasks={this.props.tasks} tasksUpdate={this.props.tasksUpdate} action="view" />
        ))}
      </div>
    );
  }
}

class TmTask extends React.Component {
  constructor(props) {
    super(props);
    this.default = {
      active_id: 'color1',
      text: '',
      action : this.props.action,
      done: false,
      colors: [
        {'id':'color1', 'value':'#EF5350'},
        {'id':'color2', 'value':'#F06292'},
        {'id':'color3', 'value':'#7E57C2'},
        {'id':'color4', 'value':'#FFE082'}
      ],
    }
    this.state = {};
    this.oldState={};
    if(props.settings!='undefined') {
      this.state = Object.assign(this.default, props.settings);
    }
    this.handleTextClick = this.handleTextClick.bind(this);
    this.handleColorClick = this.handleColorClick.bind(this);
    this.handleTextChange = this.handleTextChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleControl = this.handleControl.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  render() {
    switch (this.state.action) {
      case "newTask":
        return (
          <div ref={node => { this.node = node; }}>
            {this._getForm()}
          </div>
        );
        break;
      case "edit":
        return (
          <div className="task" style={{background:this.state.colors.filter(color=>color.id==this.state.active_id)[0].value}} ref={node => { this.node = node; }}>
            {this._getControl()}
            {this._getForm()}
          </div>
        );
        break;
      default:
        const cname = this.state.done ? "task done" : "task";
        return (
          <div className={cname} style={{background:this.state.colors.filter(color=>color.id==this.state.active_id)[0].value}} ref={node => { this.node = node; }}>
            {this._getControl()}
            <div className="text-block" onClick={this.handleTextClick}>
              {this.state.text}
            </div>
          </div>
        );
        break;
    }
  }
  _getControl() {
    return (
      <div className="control-block">
        <input type="checkbox" id={this.state.id} onChange={this.handleControl} checked={this.state.done}/>
        <label htmlFor={this.state.id}></label>
      </div>
    )
  }
  _getForm() {
    return (
      <form key={this.state.id} onSubmit={this.handleSubmit} className="task-form">
        <div className="input-container">
          <input
            placeholder="Add new item"
            onChange={this.handleTextChange}
            value={this.state.text}
          />
        </div>
        <div className="colors-block">
          {this.state.colors.map(color => (
            React.createElement(
              'span',
              {
                key: color.id,
                'data-id': color.id,
                className: (color.id == this.state.active_id ? 'active' : ''),
                style: {background:color.value},
                onClick: this.handleColorClick
              }
            )
          ))}
        </div>
        {React.createElement(
          'button',
          {},
          (this.state.id ? 'Save' : 'Add')
        )}
      </form>
    )
  }

  handleClickOutside(e) {
    if(this.state.action=="edit" && !this.node.contains(e.target)) {
      this.setState(this.oldState);
    }
  }
  handleTextClick(e) {
    if(this.state.done) return;

    this.oldState = {
      action:this.state.action,
      text:this.state.text,
      active_id:this.state.active_id,
      done: this.state.done
    };
    this.setState({action:"edit"});
  }
  handleColorClick(e) {
    this.setState({'active_id':e.target.getAttribute('data-id')});
  }
  handleTextChange(e) {
    this.setState({'text':e.target.value});
  }
  handleControl(e) {
    this.setState({done:e.target.checked});
    this.props.tasks.forEach(task=>{
      if(this.state.id==task.id) {
        task.done=e.target.checked;
      }
    });
    this._saveTaskToStorage();
    this.props.tasksUpdate();
  }
  handleSubmit(e) {
    e.preventDefault();
    if (!this.state.text.length) {
      return;
    }
    // апдейт или создание нового таска
    if(this.state.id) {
      this.state.action="view";
      this.props.tasks.forEach(task=>{
        if(this.state.id==task.id) {
          task = Object.assign(task, this.state);
        }
      });
    }
    else {
      const newTask = {
        id: Date.now(),
        active_id: this.state.active_id,
        text: this.state.text,
        done: false
      };
      this.props.tasks.push(newTask);
      this.setState(this.default);
    }
    this._saveTaskToStorage();
    this.props.tasksUpdate();
  }
  _saveTaskToStorage() {
    localStorage.tasks = JSON.stringify( this.props.tasks );
  }
}

ReactDOM.render(
  <TmApp />,
  document.getElementById('taskmanager')
);
