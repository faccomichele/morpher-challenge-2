ENV="morpher"
REGION="eu-west-1"
DNS="michelefacco.com"

aws cloudformation create-stack --stack-name "ecr-$ENV" --template-body file://cfts/ecr.yml --region $REGION

ECRF=$(aws cloudformation describe-stacks --stack-name "ecr-$ENV" --region $REGION --query "Stacks[0].Outputs[?OutputKey=='ecrfront'].OutputValue" --output text)
ECRF1=$(echo $ECRF | cut -d "/" -f 1)
ECRF2=$(echo $ECRF | cut -d "/" -f 2)
ECRB=$(aws cloudformation describe-stacks --stack-name "ecr-$ENV" --region $REGION --query "Stacks[0].Outputs[?OutputKey=='ecrback'].OutputValue" --output text)
ECRB1=$(echo $ECRB | cut -d "/" -f 1)
ECRB2=$(echo $ECRB | cut -d "/" -f 2)

aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECRF1
docker build -t $ECRF2 frontend
docker tag $ECRF2:latest $ECRF:latest
docker push $ECRF:latest

aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECRB1
docker build -t $ECRB2 backend
docker tag $ECRB2:latest $ECRB:latest
docker push $ECRB:latest

aws cloudformation create-stack --stack-name "fargate-$ENV" --template-body file://cfts/fargate.yml --region $REGION --capabilities=CAPABILITY_NAMED_IAM --parameters ParameterKey=ECRFront,ParameterValue=$ECRF:latest ParameterKey=ECRBack,ParameterValue=$ECRB:latest ParameterKey=DomainName,ParameterValue=$DNS

TASKARNS=$(aws ecs list-tasks --cluster morph-cluster --region $REGION --query "taskArns" --output text)
ENIS=$(aws ecs describe-tasks --tasks $TASKARNS --cluster morph-cluster --region $REGION --query "tasks | sort_by(@, &group) | [*][attachments[0].details[?name=='networkInterfaceId'].value]" --output text)
ENIB=$(echo $ENIS | cut -d " " -f 1)
ENIF=$(echo $ENIS | cut -d " " -f 2)

PUBB=$(aws ec2 describe-network-interfaces --network-interface-ids $ENIB --region $REGION --query "NetworkInterfaces[0].Association.PublicIp" --output text)
PUBF=$(aws ec2 describe-network-interfaces --network-interface-ids $ENIF --region $REGION --query "NetworkInterfaces[0].Association.PublicIp" --output text)

echo "
### Please, edit your local hosts file and set the two entries below ###
$PUBB api.$DNS
$PUBF app.$DNS
### Then test the application URL ###
http://app.$DNS:8080/
"