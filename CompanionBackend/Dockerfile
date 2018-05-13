# use opencv ready image from docker hub
FROM valian/docker-python-opencv-ffmpeg

# set the working directory to /app
WORKDIR /app

# copy the current directory contents into the contaiiner at /app
ADD . /app

# install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

# make port 5000 available to the world outside the container
EXPOSE 5000

# run ComputerVisionService.py
CMD ["python", "ComputerVisionService.py"]
