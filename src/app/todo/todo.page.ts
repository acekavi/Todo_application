import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable'

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

  exportToPdf(todos: Todo[]) {
    // Hardcode part to add more items
    // for (let index = 1; index < 150; index++){
    //   const newSampleTodo: Todo = {
    //     task: `Sample todo number ${index}`,
    //     completeState: false,
    //     description: 'Something Random'
    //   };
    //   todos.push(newSampleTodo);
    // };

    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4'
    });

    // Set font size and style for header
    doc.setFontSize(18);
    doc.setFont('arial', 'bold');
  
    // Add header
    doc.text('Todo List', 50, 30, {align: 'center'});
  
    // Set font size and style for table data
    doc.setFontSize(12);
    doc.setFont('arial', 'normal');
  
    // Define table column headers
    const headers = [['Task', 'Description', 'Completed']];
  
    // Set max table height per page
    const maxTableHeight = doc.internal.pageSize.height;
  
    // Define table data for each page
    let tableData = [];
  
    let currentRow = 0;
    while (currentRow < todos.length) {
      // Get the remaining todos to display
      const remainingTodos = todos.slice(currentRow);
  
      // Calculate the max rows that fit on the page
      const maxRows = Math.floor(maxTableHeight / 25);
  
      // Add rows up to the max rows or the remaining todos
      const tableRows = remainingTodos.slice(0, maxRows).map(todo => [todo.task, todo.description, todo.completeState ? 'Yes' : 'No']);

      // Add table data to array for each page
      tableData.push(tableRows);
  
      // Update current row index
      currentRow += maxRows;
    }
  
    // Add table to PDF document for each page
    tableData.forEach((tableRows, index) => {
      // Add new page for every table beyond the first
      if (index > 0) {
        doc.addPage();
      }
  
      // Add table to page
      autoTable(doc, {
        head: headers,
        body: tableRows,
        theme: 'grid',
        startY: 40, // Set table start position
        margin: { left: 15, right: 15 }, // Set table margins
        headStyles: { fillColor: [200, 200, 200] }, // Set background color for header row
        bodyStyles: { valign: 'middle' }, // Set vertical alignment for table cells
        didDrawPage: (data) => {
          // Set font size and style for footer
          doc.setFontSize(10);
          doc.setFont('times', 'normal');
          
          // Add footer
          doc.text(`Page ${index + 1}`, 300, doc.internal.pageSize.getHeight() - 20, {align: 'center'});
        }
        })
    })

    // Save PDF document
    doc.save('Todo List.pdf');
  }
}