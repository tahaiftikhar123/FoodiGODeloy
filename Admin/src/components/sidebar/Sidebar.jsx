import React,{useState}from"react"
import{NavLink}from"react-router-dom"
import"./Sidebar.css"
import{FaPlus,FaList,FaClipboardList,FaEnvelope,FaTags,FaClock}from"react-icons/fa"

const Sidebar=()=>{
const[active,setActive]=useState("Orders")

return(
<div className="sidebar">
<div className="sidebar-options">

<NavLink
to="/add"
onClick={()=>setActive("Add Items")}
className={`sidebar-item ${active==="Add Items"?"active":""}`}
>
<FaPlus className="sidebar-icon"/>
<p>Add Items</p>
</NavLink>

<NavLink
to="/list"
onClick={()=>setActive("List Items")}
className={`sidebar-item ${active==="List Items"?"active":""}`}
>
<FaList className="sidebar-icon"/>
<p>List Items</p>
</NavLink>

<NavLink
to="/orders"
onClick={()=>setActive("Orders")}
className={`sidebar-item ${active==="Orders"?"active":""}`}
>
<FaClipboardList className="sidebar-icon"/>
<p>Orders</p>
</NavLink>

<NavLink
to="/schedules"
onClick={()=>setActive("Scheduled Orders")}
className={`sidebar-item ${active==="Scheduled Orders"?"active":""}`}
>
<FaClock className="sidebar-icon"/>
<p>Scheduled Orders</p>
</NavLink>

<NavLink
to="/messages"
onClick={()=>setActive("Customer Messages")}
className={`sidebar-item ${active==="Customer Messages"?"active":""}`}
>
<FaEnvelope className="sidebar-icon"/>
<p>Customer Messages</p>
</NavLink>

<h3 className="text-gray-400 text-xs mt-4 mb-2 px-4 font-semibold">Categories</h3>

<NavLink
to="/addcategory"
onClick={()=>setActive("Add Categories")}
className={`sidebar-item ${active==="Add Categories"?"active":""}`}
>
<FaPlus className="sidebar-icon"/>
<p>Add Categories</p>
</NavLink>

<NavLink
to="/listcategory"
onClick={()=>setActive("List Categories")}
className={`sidebar-item ${active==="List Categories"?"active":""}`}
>
<FaTags className="sidebar-icon"/>
<p>List Categories</p>
</NavLink>

</div>
</div>
)
}

export default Sidebar
