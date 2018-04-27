import * as Generator from 'yeoman-generator';

import { SingleQuestion, ISingleQuestionPrompt } from 'yeoman-generator';
interface PromptSuggestion{
  storeAnswers:(store:any, questions:any, answers:any, storeAll:any)=>void,
  prefillQuestions:(store:any,questions:any)=>any[]
}
const promptSuggestion:PromptSuggestion= require('yeoman-generator/lib/util/prompt-suggestion');
interface AnyFn{
  (...args:any[]):any
}



//type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> typescript 2.8
export type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T]
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>


export type SingleQuestionWithoutName<V=any>=Omit<SingleQuestion<V>,"name">

export type NamedKeyOfType<T>={
  name: keyof T
}

export interface SingleTypedNameQuestion<T> extends SingleQuestionWithoutName,NamedKeyOfType<T>{}




export class PromptHelper<T extends Generator>{
  constructor(private prompter:T,private namespaceAll=false){}

  unsafeSingleQuestionPrompt<V>(question:Generator.SingleQuestion<V>,namespace?:boolean){
    if(namespace===undefined){
      namespace=this.namespaceAll;
    }
    return PromptHelper.unsafeSingleQuestionPrompt(this.prompter,question,namespace);
  }
  singleQuestionPrompt<V>(question:SingleQuestion<V>,namespace?:boolean){
    if(namespace===undefined){
      namespace=this.namespaceAll;
    }
    return PromptHelper.singleQuestionPrompt(this.prompter,question,namespace);
  }
  singleQuestionPromptAndAssign(question:SingleTypedNameQuestion<T>,namespace?:boolean){
    if(namespace===undefined){
      namespace=this.namespaceAll;
    }
    return PromptHelper.singleQuestionPromptAndAssign(this.prompter,question,namespace);
  }
  static namespaceQuestion<V>(prompter:Generator,question:SingleQuestion<V>,namespace:boolean){
    let name=question.name?question.name:"name";


    if(namespace){
      name=(prompter.options as any)["namespace"]  + ":" + name;
    }
    question.name=name;
  }
  static singleQuestionPrompt<V>(prompter:Generator,question:SingleQuestion<V>,namespace=false){
    PromptHelper.namespaceQuestion(prompter,question,namespace);
    return (prompter.prompt.bind(prompter) as ISingleQuestionPrompt)(question).then(a=>{
      return a[question.name as string];
    })
  }
  static singleQuestionPromptAndAssign<T extends Generator> (prompter:T,question:SingleTypedNameQuestion<T>,namespace=false){
    const originalName=question.name;
    return PromptHelper.singleQuestionPrompt(prompter,question,namespace).then(a=>{
      prompter[originalName]=a;
    })
  }
  static unsafeSingleQuestionPrompt<V>(prompter:Generator,question:Generator.SingleQuestion<V>,namespace=false){
    PromptHelper.namespaceQuestion(prompter,question,namespace);

    const globalConfig=(prompter as any)._globalConfig;
    let questions = promptSuggestion.prefillQuestions(globalConfig, question);
    questions = promptSuggestion.prefillQuestions(prompter.config, questions);

    question=questions[0] as Generator.SingleQuestion<V>;
    const storeQuestionName=question.name as string;
    question.name="name"

    const adapter=(prompter.env as any).adapter as Generator.IPrompter;
    return adapter.prompt(question).then(answers => {
      if (!(prompter.options as any)['skip-cache']) {
        const fixedAnswers={[storeQuestionName]:answers.name}
        question.name=storeQuestionName;
        promptSuggestion.storeAnswers(globalConfig, questions, fixedAnswers, false);
        promptSuggestion.storeAnswers(prompter.config, questions, fixedAnswers, true);
      }
      return answers.name;

    });
  }

}

