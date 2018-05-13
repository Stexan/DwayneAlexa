#!/bin/bash
source .env

# If the archive exists, delete the old one
if [ -e index.zip ]; then
	rm index.zip 
fi

# Set zip command dependent on OS
generateZip='zip -X '
if [[ ${PLATFORM} == 'MAC' ]]; then
   generateZip='zip '
fi

# Expand node modules and create zip of lambda code
cd src
npm install
#zip -X -r ../index.zip *
echo "----- Creating Zip -----"
$generateZip -r ../index.zip * 
cd .. 
echo "----- Zip creation complete -----"

# Configure aws
echo "----- Configuring aws CLI -----"
aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID}
aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY}
aws configure set region ${AWS_REGION}
aws configure set output ${AWS_OUTPUT}
echo "----- Finished configuration -----"

# Update the lambda function
echo "----- Publishing lambda function to aws -----"
aws lambda update-function-code --function-name ${AWS_FUNCTION_NAME} --zip-file fileb://index.zip
echo "----- Finished publishing -----"
echo "----- Updating lambda function configuration -----"
aws lambda update-function-configuration --function-name ${AWS_FUNCTION_NAME} --environment '{"Variables":{"ALEXA_APP_ID":"'${ALEXA_APP_ID}'"}}'
echo "----- Finished updating -----"

# Cleanup
echo "----- Cleaning up aws configuration  -----"
aws configure set aws_access_key_id "foo"
aws configure set aws_secret_access_key "bar"
rm index.zip 
echo "----- Finished Succesfully  -----"

