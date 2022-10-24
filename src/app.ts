class ProjectInput {
    templateElement : HTMLTemplateElement;
    hostElement : HTMLDivElement;
    element : HTMLFormElement;
    titleInputElement : HTMLInputElement;
    descriptionInputElement : HTMLInputElement;
    peopleInputElement : HTMLInputElement;

    constructor(){
        // We you casting 'as' the let TS knows the type of the element
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        // provide and id to link the css
        this.element.id = 'user-input';

        // provide an acces to the form's inputs insid of the class
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        // Execute the methods
        this.configure();
        this.attach();
    }

    // Private limits the access of a method property inside of the class

    // This method will trigger whenever the form is submitted
    private submitHandler(event : Event){
        event.preventDefault();
        console.log(this.titleInputElement.value)
    }


    // Method to setup the Eventlisteners
    // bind is used to preconfigure how this function is going to execute
    // and when it will execute we pass this to say this will be the same
    // this of the context of configure 
    private configure () {
        this.element.addEventListener('submit', this.submitHandler.bind(this))
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const projectInput = new ProjectInput();