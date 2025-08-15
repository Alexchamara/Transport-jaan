import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
// import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
// import GuestLayout from '@/Layouts/GuestLayout';
import { usePage} from '@inertiajs/react';
import { useForm , Link } from '@inertiajs/react';



const CustomerForm = ({ vehicle_types = [], vendors = [] }) =>{
    const { data, setData, post, processing, errors, reset } = useForm({
        date: '',
        pick_up_location: '',
        vehicle_type_id: '',
        vendor_id: '',
    });

    const{props} = usePage();
    const successMessage = props.flash?.success;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('customer.store'),{
          preserveScroll:true,
          onSuccess: () =>reset(),
          onError: (errors) => {
            console.log('Form errors:', errors);
          }
        });
      };
    
   return (
    <div className="p-6 max-w-4xl mx-auto">
         <h1 className="text-2xl font-bold mb-6">Add New Customer</h1>
         {successMessage && (
            <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
            {successMessage}
            </div>
         )}
         <form onSubmit={handleSubmit} className="space-y-6">
            {/* <input type="hidden" name="_token" value={window.csrf_token} /> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <InputLabel htmlFor="pick_up_location" value="Pick up Location" />
                    <TextInput
                        id="pick_up_location"
                        name="pick_up_location"
                        value={data.pick_up_location}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('pick_up_location', e.target.value)}
                        required
                    />
                    <InputError message={errors.pick_up_location} className="mt-2" />
                </div>
                <div>
                 <InputLabel htmlFor="date" value="Date" />
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={data.date}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('date', e.target.value)}
                        required
                    />
                    <InputError message={errors.date} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="vehicle_type_id" value="Vehicle Type"/>
                        <select
                            id="vehicle_type_id"
                            name="vehicle_type_id"
                            value={data.vehicle_type_id}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            onChange={(e) => setData('vehicle_type_id', e.target.value)}
                            required
                        >
                            <option value="">Select Vehicle Type</option>
                                {vehicle_types.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.type}
                                    </option>
                                ))}
                        </select>
                    <InputError message={errors.vehicle_type_id} className="mt-2" />
                </div>
                <div>
                  <InputLabel htmlFor="vendor_id" value="Vendor"/>
                    <select
                        id="vendor_id"
                        name="vendor_id"
                        value={data.vendor_id}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        onChange={(e) => setData('vendor_id', e.target.value)}
                        required
                    >
                        <option value="">Select Vendor </option>
                            {vendors.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.business_name}
                                </option>
                        ))} 
                    </select>
                    <InputError message={errors.vendor_id} className="mt-2" />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    {/* <Link 
                        href={route('customer.index')} 
                        className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Link> */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </form>
    </div>     
   );
};

export default CustomerForm;
   

    


