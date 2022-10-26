const mongoose = require('mongoose')

const marvelsSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		power: {
			type: String,
			required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Marvel', marvelsSchema)