import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TableRepository from '../repository';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(3),
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
}));

export default function SimpleTable() {
  const [customerData, setCustomerData] = useState(null)
  const [invoicesData, setInvoicesData] = useState(null)
  const [tableData, setTableData] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const customer = await TableRepository.getCustomerInfo();
      setCustomerData(customer)
    }
    
    fetchData()
  }, [])

  useEffect(() => {
    if (customerData) {
      async function fetchData() {
        const customerIds = customerData.map(customer => customer.id)
        const invoices = await TableRepository.getInvoiceForCustomers(customerIds)
        setInvoicesData(invoices)
      }
  
      fetchData()
    }
  }, [customerData])

  useEffect(() => {
    if (customerData && invoicesData) {
      function createTable() {
        const data = customerData.map(customer => {
          const noData = 'no-invoice-data'
          const customerInvoices = invoicesData
            .find(invoices => invoices[customer.id])[customer.id]

          const paidInvoices = customerInvoices
            ? customerInvoices.map(invoice => invoice.paid).length
            : noData

          const totalAmountPaid = customerInvoices
            ? customerInvoices.reduce((acc, current) => acc + current.amount_paid, 0)
            : noData
          const unpaidInvoices = customerInvoices
            ? customerInvoices.length - paidInvoices
            : noData

          const totalAmountDue = customerInvoices
            ? customerInvoices.reduce((acc, current) => acc + current.amount_due, 0)
            : noData

          return {
            id: customer.id,
            email: customer.email,
            paidInvoices,
            totalAmountPaid,
            unpaidInvoices,
            totalAmountDue
          }
        })
        setTableData(data)
      }

      createTable()
    }
  }, [customerData, invoicesData])

  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell align="right">Email</TableCell>
            <TableCell align="right">Paid Invoices</TableCell>
            <TableCell align="right">Total Amount Paid</TableCell>
            <TableCell align="right">Unpaid Invoices</TableCell>
            <TableCell align="right">Total Amount Due</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData && tableData.map(row => (
            <TableRow key={row.id}>
              <TableCell component="th" scope="row">
                {row.id}
              </TableCell>
              <TableCell align="right">{row.email}</TableCell>
              <TableCell align="right">{row.paidInvoices}</TableCell>
              <TableCell align="right">{row.totalAmountPaid}</TableCell>
              <TableCell align="right">{row.unpaidInvoices}</TableCell>
              <TableCell align="right">{row.totalAmountDue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
