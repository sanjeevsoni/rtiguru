/* global _ */
import React, {Component} from 'react';
import Banner from './ApplyBanner';
import ApplyByCategories from './ApplyByCategories';
import Http from '../../lib/Http';
import { connect } from "react-redux";
import {AlertDialog} from '../common/AlertDialog';
import { push } from 'react-router-redux';

class ApplyRTI extends Component {
	constructor(){
		super();
		this.formSubmit = this.formSubmit.bind(this);      	
		this.state = {
			category:{},
			rtiFormStep: {},
			message:"",
			showModal: false
		}
	}
	componentDidMount() {
		const {match} = this.props;
		Http.get(`get-a-post?type=category&slug=${match.params.slug}`)
		.then(({data}) => this.setState({category: data}))
		.catch(error => console.log(error));
	}
	render() {
		const {category} = this.state;
		return(
			<div>
				<Banner categoryName={category.label}/>
				<ApplyByCategories onSubmit={this.formSubmit} category={category}/>
				<AlertDialog show={this.state.showModal} message={this.state.message} hideModal={() => this.hideSuccessDialog()}/>
			</div>
		);	
	}
	formSubmit(values) {
		const {category} = this.state;
		
		const {_id} = this.props.user;
		return new Promise((resolve, reject) => {
			Http.post('apply-rti', {
				category: {_id: category._id, title: category.title},
				rti: values,
				info: values,
				userId: _id
			})
			.then(response => {
				this.showSuccessDialog(response.message);
				resolve();
			})
			.catch(error => {
				this.showSuccessDialog(error.message);
				reject();
			});
		});
		
	}
	showSuccessDialog(message) {
	    // change the local ui state
	    this.setState({showModal: true, message: message });
	}

  // hide the delete user prompt
  	hideSuccessDialog() {
  		this.setState({showModal: false });
  		sessionStorage.removeItem('rtiguru.rtiFormStep');
  		this.props.dispatch(push('/'));
  	}
}	

const mapStateToProps = (state) => {
	const {rtiFormStep} = state;
	if( !_.isEmpty(rtiFormStep.info) ) {
		return ({
			rtiFormStep,
			user: state.auth.user
		});	
	} else {
		return ({
			user: state.auth.user
		});
	}
}

export default connect(mapStateToProps)(ApplyRTI);