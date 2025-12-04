import React from 'react'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import add_product_icon from '../../assets/Product_Cart.svg'
import list_product_icon from '../../assets/Product_list_icon.svg'
import order_icon from '../../assets/order.png'
import icon from '../../assets/icon.png'
import invoi from '../../assets/invoi.png'



const Sidebar = () => {
  return (
    <div className='sidebar'>
        <Link to ={'/addproduct'} style = {{textDecoration: "none"}}> 
            <div className='sidebar-item'>
                <img src={add_product_icon} alt="" />
                <p>Add Product</p>
            </div>
        </Link>
        <Link to ={'/listproduct'} style = {{textDecoration: "none"}}> 
            <div className='sidebar-item'>
                <img src={list_product_icon} alt="" />
                <p>List Product</p>
            </div>
        </Link>
        <Link to ={'/adminproduct'} style = {{textDecoration: "none"}}> 
            <div className='sidebar-item'>
                <img src={order_icon} alt="" />
                <p>List Orders </p>
            </div>
        </Link>
        <Link to ={'/contactproduct'} style = {{textDecoration: "none"}}> 
            <div className='sidebar-item'>
                <img src={icon} alt="" />
                <p>Feedbacks </p>
            </div>
        </Link>
        <Link to ={'/admininvoices'} style = {{textDecoration: "none"}}> 
            <div className='sidebar-item'>
                <img src={invoi} alt="" />
                <p>Invoice PDF </p>
            </div>
        </Link>
        <Link to ={'/dashboard'} style = {{textDecoration: "none"}}> 
            <div className='sidebar-item'>
                <img src={invoi} alt="" />
                <p>Dashboard</p>
            </div>
        </Link>
    </div>
  )
}
export default Sidebar