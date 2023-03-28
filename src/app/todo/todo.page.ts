import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

import {jsPDF} from 'jspdf';

export interface Todo {
  task: string;
  completeState: boolean;
  description: string;
}

@Component({
  selector: 'app-todo',
  templateUrl: './todo.page.html',
  styleUrls: ['./todo.page.scss'],
})

export class TodoPage implements OnInit {
  
  constructor(public alertCtrl: AlertController) { }

  // Todo object array
  todos: Todo[] = [];

  ngOnInit() {
  }

  ionViewWillEnter() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      this.todos = JSON.parse(storedTodos);
   }};
  
  async addTodo() {
    const alert = await this.alertCtrl.create({
      header: 'Add a Todo',
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Title'
        },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            if (data.title) {
              const newTodo: Todo = {
                task: data.title,
                completeState: false,
                description: data.description || ''
              };
              this.todos.unshift(newTodo);
              localStorage.setItem('todos', JSON.stringify(this.todos));
            }
          }
        }
      ]
    });
    await alert.present();
  }

  removeTodo(todo: Todo){
    const indexOfItem = this.todos.findIndex((object) => {
      return object === todo;
    });

    this.todos.splice(indexOfItem, 1);
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  completeTodo(todo: Todo) {
    todo.completeState = !todo.completeState;
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  exportToPdf() {
    const doc = new jsPDF();
  
    // Add header
    const header = 'Todo List';
    const headerHeight = 10;
    const headerWidth = doc.getStringUnitWidth(header) * doc.getFontSize() / doc.internal.scaleFactor;
    const headerX = (doc.internal.pageSize.getWidth() - headerWidth) / 2;
    const headerY = 10;
    doc.text(header, headerX, headerY);
  
    // Add footer
    const pageCount = doc.getNumberOfPages();
    const footerHeight = 10;
    const footerWidth = doc.internal.pageSize.getWidth();
    const footerX = 10;
    const footerY = doc.internal.pageSize.getHeight() - footerHeight;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(`Page ${i} of ${pageCount}`, footerX, footerY);
    }
  
    // Add todo list
    const todoList = this.todos.map((todo, index) => {
      let state = todo.completeState ? "Completed" : "To be completed";
      return `${index + 1}. ${todo.task} - ${todo.description} - ${state}`;
    });
    const todoListText = todoList.join('\n');
    doc.setFontSize(12);
    doc.text(todoListText, 20, 30);
  
    // Save PDF
    doc.save('todo-list.pdf');
  }  
  
}
