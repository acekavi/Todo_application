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
    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4'
    });
  
    // Set font size for header and footer
    const headerFooterFontSize = 10;
  
    // Set margins
    const marginX = 20;
    const marginY = 30;
  
    // Add header
    const header = 'Todo List';
    const headerWidth = doc.getStringUnitWidth(header) * headerFooterFontSize / doc.internal.scaleFactor;
    const headerX = (doc.internal.pageSize.getWidth() - headerWidth) / 2;
    const headerY = marginY;
    doc.setFontSize(headerFooterFontSize);
    doc.text(header, headerX, headerY);
  
    // Add footer
    let pageCount = doc.getNumberOfPages();
    const footerWidth = doc.internal.pageSize.getWidth();
    const footerX = 0;
    const footerY = doc.internal.pageSize.getHeight() - marginY;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(headerFooterFontSize);
      doc.text(`Page ${i} of ${pageCount}`, footerX, footerY, { align: 'center' });
    }
  
    // Add todo list
    const todoList = this.todos.map((todo, index) => {
      return `${index + 1}. ${todo.task} - ${todo.description} - ${todo.completeState}`;
    });

    for (let index = 1; index < 150; index++){
      todoList.push(`${this.todos.length + index}. Sample Task - ${index} - False`)
    }

    const todoListText = todoList.join('\n');
    const todoListLines = doc.splitTextToSize(todoListText, doc.internal.pageSize.getWidth() - 2 * marginX);
    const availableHeight = doc.internal.pageSize.getHeight() - 2 * marginY - headerFooterFontSize - 2 * headerFooterFontSize; // subtract header and footer heights
    let currentY = headerY + headerFooterFontSize;
    let currentPage = 1;
    for (let i = 0; i < todoListLines.length; i++) {
      const line = todoListLines[i];
      const lineHeight = doc.getFontSize();
      if (currentY + lineHeight > availableHeight) {
        doc.addPage();
        currentPage++;
        pageCount++;
        currentY = marginY;
        // Add header and footer to new page
        doc.setFontSize(headerFooterFontSize);
        doc.text(header, headerX, currentY);
        doc.setFontSize(headerFooterFontSize);
        doc.text(`Page ${currentPage} of ${pageCount}`, footerX, footerY, { align: 'center' });
        currentY += headerFooterFontSize + headerFooterFontSize;
      }
      doc.setFontSize(12);
      doc.text(line, marginX, currentY);
      currentY += lineHeight;
    }
  
    // Save PDF
    doc.save('todo-list.pdf');
  }  
  
}
