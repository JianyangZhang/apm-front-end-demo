import * as React from "react";
import * as ReactDOM from "react-dom";
import { connect } from 'react-redux';
import {ViewContainer, ToggleButton } from "../components/View.tsx";
// import {TreeViewCloseButton, TreeView} from  "../components/TreeView.tsx";
import {TreeView} from "../components/TreeView2.tsx";
import ServerDash from "../components/monitor/ServerDash";
import TomcatDash from "../components/monitor/TomcatDash";
import OracleDash from "../components/monitor/OracleDash";
import { loadMonitorData } from "../actions/MonitorActions";
import { loadResData } from "../actions/ResourceActions";
import { getBreadcrumbModuleAction } from "../actions/NavigatorActions";

//tomcat临时测试数据
import {tomcatData} from "../constants/TomcatTempData";

//Oracle临时测试数据
import {oracleData} from "../constants/OracleTempData";


export class Monitor extends React.Component<any, any> {

	constructor(props, context) {
	    super(props, context);
	    this.state = {treeViewShow:false, toggleButtonShow:true}
    }

    componentDidMount() {
       const {loadMonitorData,setBreadcrumbModule, resId} = this.props;
       //加载默认
        loadMonitorData("-1", "server");
        setBreadcrumbModule(["业务监控"]);
    }

	handleToggleButtonClick = () => {
		this.setState({treeViewShow:true, toggleButtonShow:false})
	}

	handleTreeViewCloseButtonClick = () => {
		this.setState({treeViewShow:false, toggleButtonShow:true})
	}

    handleTreeItemClick = (itemInfo) => {
        const {loadMonitorData} = this.props;
        loadMonitorData(itemInfo.id, itemInfo.resType)
    }

    createResTreeModel = () => {
        const {resource} = this.props;
        const groupList = Object.keys(resource.groups)
                                .map(key=>resource.groups[key])

        const result = groupList.map((group)=>{
            let groupItem = {id:group.id, name:group.name, type:"folder", itemList:[]};
            let devSubGroupItem = {id:group.id + '_device', name:"基础设施", type:"folder", itemList:[]};
            let servSubGroupItem = {id:group.id + '_service', name:"业务应用", type:"folder", itemList:[]};

            devSubGroupItem.itemList = 
                    Object.keys(resource.devices).map(key=>resource.devices[key])
                                                .filter(dev=>dev.groupId == group.id)
                                                .map(dev=>{return {id:dev.id, name:dev.name, type:"file", resType:dev.type}})

            servSubGroupItem.itemList = 
                    Object.keys(resource.services).map(key=>resource.services[key])
                                     .filter(serv=>serv.groupId == group.id)
                                     .map((serv, index)=>{return {id:serv.id, name:serv.name, type:"file",resType:serv.type}})


            groupItem.itemList.push(devSubGroupItem)
            groupItem.itemList.push(servSubGroupItem)
            return groupItem;
        })
        return result;
    }

    createMonitorView = () => {
        const {resId, resType, data, loaders} = this.props;
        let monitorView;
        switch(resType) {
            case "server":
                monitorView = <ServerDash procInfo={data["process"]} basicInfo={data["basicInfo"]} 
                                cpuUsage={data["cpuUsage"]} memUsage={data["memUsage"]}
                                fileSysUsage={data["fileSysUsage"]} diskIO={data["diskIO"]}
                                networkIO={data["networkIO"]} loaders={loaders}/>
                break;
            case "tomcat":
                monitorView = <TomcatDash matrixData={tomcatData}/>
                break;
            case "oracle":
                monitorView = <OracleDash matrixData={oracleData}/>
                break;
            default:
                monitorView = (<div style={{minHeight:"500px"}}>
                                  <h5>未知的资源类型</h5>
                               </div>)
        }
        return monitorView;
    }

    render() { 
        const treeModel = this.createResTreeModel();
        const monitorView = this.createMonitorView();
        return (
        	<ViewContainer styleList={{backgroundColor:"#f2f2f2"}}>
                <ToggleButton handleClick={this.handleToggleButtonClick} 
                              hidden={!this.state.toggleButtonShow}/>
                <TreeView show={this.state.treeViewShow} itemList={treeModel} handleClick={this.handleTreeItemClick} handleClose={this.handleTreeViewCloseButtonClick}/>
                {monitorView}        	
            </ViewContainer>   	
        )
    }
}

const mapStateToProps = state => ({
    resId:state.monitorReducer.monitor.resId,
    resType:state.monitorReducer.monitor.resType,
    data:state.monitorReducer.monitor.data,
    loaders:state.monitorReducer.monitor.loaders,
    resource:state.resourceReducer.resource
});

const mapDispatchToProps = dispatch  => ({
    loadMonitorData:(resId, resType)=> dispatch(loadMonitorData(resId,resType)),
    setBreadcrumbModule:(data) => dispatch(getBreadcrumbModuleAction(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Monitor);



