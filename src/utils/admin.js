const bcrypt = require('bcryptjs')
const Admin = require('../models/admin')
const AdminCode = require('../models/adminCode')

const getToValidate = (interpreters) => {
    const toValidate = interpreters.map(interpreter => {
        const unvalidatedCertificates = []

        interpreter.certifications.forEach(certificate => {
            if (!certificate.isValidated && !certificate.isRejected) {
                unvalidatedCertificates.push({
                    id: certificate.id,
                    title: certificate.title,
                    image: certificate.file.url
                })
            }
        })

        return {
            name: interpreter.name,
            avatar: interpreter.avatar.url,
            location: interpreter.location.str,
            unvalidatedCertificates: unvalidatedCertificates,
        }
    })

    return toValidate
}

const checkAdminCode = async (code) => {
    const adminCodes = await AdminCode.find({})
    let isMatch = false

    if (!adminCodes) {
        throw new Error('No admin codes exist.')
    }

    for (const adminCode of adminCodes) {
        isMatch = await bcrypt.compare(code, adminCode.code)

        if (isMatch) {
            return true
        }
    }

    throw new Error('No matched admin codes.')
}

module.exports = {
    getToValidate,
    checkAdminCode
}
