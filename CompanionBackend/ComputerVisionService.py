from flask_api import FlaskAPI
import ComputerVisionLogic
from multiprocessing.pool import ThreadPool
from flask_cors import CORS
from json import dumps


app = FlaskAPI(__name__)
CORS(app)
#workout_thread = threading.Thread(target=computer_vision.start_workout, args=(), kwargs={})
workout_pool = ThreadPool(processes=1)
async_result = None

@app.route('/dwayne_alexa/start')
def start_workout_api():
    global workout_pool, async_result

    async_result = workout_pool.apply_async(ComputerVisionLogic.start_workout, ()) # tuple of args for foo

    #stats = computer_vision.start_workout()
    return {'dwayne': "the rock"}

@app.route('/dwayne_alexa/stats')
def get_stats_api():
    global async_result
    if async_result != None:
        stats = async_result.get()
        return {'squats': stats}
    else:
        return {'ERROR': "Don't have any stats"}

@app.route('/dwayne_alexa/check')
def get_state_api():
    x = open("workout_state").read()
    if len(x) > 3:
        workout_position, workout_state = x.split("|")
        #print x
        print workout_state
        if workout_state == "False":
            return {'position' : int(workout_position), 'state' : False}
        else:
        #print workout_state
            return {'position' : int(workout_position), 'state' : True}
    return x


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
