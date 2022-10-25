// Project state Management
class ProjectState {
    private projects : any[] = [];
    private static instance : ProjectState;
    private listeners : any [] = [];

    private constructor() {

    }

    static getInstance () {
        if (this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addListener(listernerFn: Function){
        this.listeners.push(listernerFn);
    }

    addProject(title: string, description: string, numOfPeople: number){
        const newProject = {
            id : Math.random().toString(),
            title: title,
            description: description,
            people: numOfPeople
        };
        this.projects.push(newProject);
        for (const listernerFn of this.listeners){
            listernerFn(this.projects.slice());
        }
    }
}

// Global Project Instance
const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
    // ? make it optional could be replace by | undefined
    // min max are for numbers
    value : string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

// Function where we use Validate interface (structure) and who is reusable 
function validate(validateInput : Validatable){
    let isValid = true;
    if (validateInput.required){
        // check if the input is not empty 
        // to string will convert a number to a string and we are
        // able to use trim method
        isValid = isValid && validateInput.value.toString().trim().length !== 0;
    }
    // as we are checking a string, we add a type guard
    // != include null and undefined
    if (validateInput.minLength != null && typeof validateInput.value === 'string'){
        isValid = isValid && validateInput.value.length > validateInput.minLength;
    }
    if (validateInput.maxLength != null && typeof validateInput.value === 'string'){
        isValid = isValid && validateInput.value.length < validateInput.maxLength;
    }
    if (validateInput.min != null && typeof validateInput.value === 'number'){
        isValid = isValid && validateInput.value > validateInput.min
    }
    if (validateInput.max != null && typeof validateInput.value === 'number'){
        isValid = isValid && validateInput.value < validateInput.max
    }
    return isValid
}

//autobind decorator
// used to don't have to call bind method many times
function autobind (
    target: any, 
    methodName: string, 
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable : true,
        get () {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

// Project List
class ProjectList {
    templateElement : HTMLTemplateElement;
    hostElement : HTMLDivElement;
    element : HTMLElement;
    assignedProjects : any[];

    constructor(private type:'active' | 'finished') {
         // We use casting 'as' the let TS knows the type of the element
         this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
         this.hostElement = document.getElementById('app')! as HTMLDivElement;
         this.assignedProjects = [];
 
         const importedNode = document.importNode(this.templateElement.content, true);
         this.element = importedNode.firstElementChild as HTMLElement;
         // provide a dynamic id to link the css
         this.element.id = `${this.type}-projects`;

        projectState.addListener((projects : any[]) => {
            this.assignedProjects = projects;
            this.renderProjects()
        })

         this.attach();
         this.renderContent();
    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        for (const prjItem of this.assignedProjects){
            const listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listEl.appendChild(listItem)
        }
    }

    private renderContent () {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase()+ ' PROJECTS';
    }

    private attach(){
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }
}

// Project input Class
class ProjectInput {
    templateElement : HTMLTemplateElement;
    hostElement : HTMLDivElement;
    element : HTMLFormElement;
    titleInputElement : HTMLInputElement;
    descriptionInputElement : HTMLInputElement;
    peopleInputElement : HTMLInputElement;

    constructor(){
        // We use casting 'as' the let TS knows the type of the element
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        // provide an id to link the css
        this.element.id = 'user-input';

        // provide an acces to the form's inputs inside of the class
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        // Execute the methods
        this.configure();
        this.attach();
    }

    // private method to get inputs values in order to validate and return them
    // tuple or void if error
    private gatherUserInput():[string, string, number]| void{
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidate : Validatable = {
            value :enteredTitle,
            required : true
        }
        const descValidate : Validatable = {
            value :enteredDescription,
            required : true,
            minLength : 5
        }
        const peopleValidate : Validatable = {
            value : +enteredPeople,
            required : true,
            min : 1,
            max : 5
        }

        if (
            !validate(titleValidate) ||
            !validate(descValidate) ||
            !validate(peopleValidate)
        ){
            alert("Invalid input please try again");
            return;
        }else{
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInputs(){
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    // Private limits the access of a method property inside of the class

    @autobind
    // This method will trigger whenever the form is submitted
    private submitHandler(event : Event){
        event.preventDefault();
        const userInput = this.gatherUserInput();
        
        if(Array.isArray(userInput)){
            const [title,desc, people] = userInput;
            projectState.addProject(title,desc, people);
            this.clearInputs();
        }
    }


    // Method to setup the Eventlisteners
    // bind is used to preconfigure how this function is going to execute
    // and when it will execute we pass this to say this will be the same
    // this of the context of configure 
    private configure () {
        // this.element.addEventListener('submit', this.submitHandler.bind(this))
        // bind is apply from the decorator, no need to call it anymore
        this.element.addEventListener('submit', this.submitHandler)
    }
    
    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');